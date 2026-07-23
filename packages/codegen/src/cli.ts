import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getFigmaAccessToken } from "./figma";
import { getAnthropicClient, getCodegenModel } from "./anthropic";
import {
  findRepoRoot,
  loadManifest,
  loadTokens,
  loadComponentContract,
  loadCommittedContracts,
  loadAllComponentRows,
  writeComponent,
  type ComponentContractFile,
} from "./loaders";
import { buildComponentIndex } from "./dependencies";
import { fetchComponentDesignSpec } from "./figma-node";
import { generateComponentCodeReviewed, fixComponentFiles, type ComponentForCodegen, type ComponentContract } from "./component";
import { buildIconComponentFiles } from "./icon";
import { fetchIconSvg } from "./icon-fetch";
import { componentSourcePaths, componentIdentifier, type GeneratedComponentFiles } from "./paths";
import { runPackageTypecheck } from "./tsc-runner";
import { runValidationLoop } from "./validate";
import type { GeneratedFiles } from "./review";
import { runVisualReview } from "./visual";
import { fetchNodeImage } from "./figma-image";
import { reviewVisualDiff } from "./visual-diff";
import { runSync, writeSync } from "./sync";
import { deleteComponent } from "./delete";
import { estimateCostUsd } from "./models";

const HELP = `codegen -- design-system component generator

Usage:
  codegen generate <slug> [--icon] [--max-rounds <n>] [--result-file <path>]
                                     Distill the Figma node and generate the
                                     component's tsx/scss/stories/index +
                                     <slug>.contract.json into packages/components.
                                     Then typechecks the package and, on a
                                     failure, asks the model to fix it (repeats
                                     up to --max-rounds times; default 3 -- icons
                                     are tsc-only, never LLM-fixed). Always writes
                                     a codegen-result.json summary and exits 0
                                     (the workflow opens the PR either way; a
                                     needs-human label carries any remaining
                                     findings). A hard error still exits non-zero.
  codegen visual <slug> --rendered <png>  Vision-diff the rendered Default-story
                                     screenshot vs the Figma design; writes
                                     visual-result.json (advisory).
  codegen sync                       Read the Figma library -> write manifest +
                                     tokens + seed contracts (needs
                                     FIGMA_ACCESS_TOKEN).
  codegen delete <slug>              Remove a component from the repo: its
                                     source dir, manifest entry, and barrel
                                     export line. Deterministic, no network.
  codegen doctor                     Check env + manifest presence (no network).
  codegen --help                     Show this help.

Flags (generate):
  --icon                Force icon generation (deterministic, no LLM).
  --max-rounds <n>       Max fix rounds after the first typecheck (default: 3).
  --result-file <path>   Where to write the result JSON
                         (default: <repoRoot>/codegen-result.json).

Environment (for generate):
  FIGMA_ACCESS_TOKEN   Figma personal access token (figd_...).
  ANTHROPIC_API_KEY    Anthropic key (not needed for --icon).
  CODEGEN_MODEL        Optional model id override (default: package default).
  FIGMA_FILE_KEY       Optional; overrides the manifest's figmaFileKey.
`;

function resolveFileKey(root: string): string {
  const fromEnv = process.env.FIGMA_FILE_KEY;
  const fromManifest = loadManifest(root).figmaFileKey;
  const key = fromEnv || fromManifest;
  if (!key) throw new Error("No Figma file key: set FIGMA_FILE_KEY or add figmaFileKey to design-system.manifest.json");
  return key;
}

function doctor(): number {
  const checks: [string, boolean][] = [];
  let root = "";
  try {
    root = findRepoRoot();
    checks.push([`manifest found at ${root}/design-system.manifest.json`, true]);
  } catch {
    checks.push(["design-system.manifest.json found", false]);
  }
  checks.push(["FIGMA_ACCESS_TOKEN set", !!process.env.FIGMA_ACCESS_TOKEN]);
  checks.push(["ANTHROPIC_API_KEY set", !!process.env.ANTHROPIC_API_KEY]);
  checks.push([`model = ${getCodegenModel()}`, true]);
  if (root) {
    const m = loadManifest(root);
    checks.push([`manifest lists ${m.components.length} components + ${m.icons.length} icons`, true]);
    checks.push(["figma file key resolvable", !!(process.env.FIGMA_FILE_KEY || m.figmaFileKey)]);
  }
  for (const [label, ok] of checks) console.log(`${ok ? "ok  " : "MISS"} ${label}`);
  return 0; // doctor never fails the process -- it reports.
}

interface CodegenResult {
  slug: string;
  isIcon: boolean;
  passed: boolean;
  rounds: number;
  findings: { file: string; message: string }[];
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCostUsd: number;
}

function writeResult(root: string, resultFile: string | undefined, r: CodegenResult): void {
  const path = resultFile ?? join(root, "codegen-result.json");
  writeFileSync(path, JSON.stringify(r, null, 2) + "\n");
  console.log(`result → ${path} (passed=${r.passed}, rounds=${r.rounds}, findings=${r.findings.length})`);
}

/** Rebuild the path-carrying GeneratedComponentFiles from a fixed GeneratedFiles
 *  (contract/deletePaths/costs preserved from the initial generation). */
function toSource(
  slug: string,
  isIcon: boolean,
  files: GeneratedFiles,
  base: GeneratedComponentFiles,
): GeneratedComponentFiles {
  const p = componentSourcePaths(slug, isIcon);
  return {
    ...base,
    componentName: p.componentName,
    tsxPath: p.tsxPath, tsxContent: files.tsx,
    cssPath: p.cssPath, cssContent: files.css,
    storiesPath: p.storiesPath, storiesContent: files.stories,
    indexPath: p.indexPath, indexContent: files.index,
  };
}

async function generate(slug: string, forceIcon: boolean, opts: { maxRounds: number; resultFile?: string }): Promise<number> {
  const maxRounds = opts.maxRounds;
  const resultFile = opts.resultFile;
  const root = findRepoRoot();
  const existing = loadComponentContract(slug, root);
  const manifest = loadManifest(root);
  const entry =
    manifest.components.find((c) => c.slug === slug) ?? manifest.icons.find((c) => c.slug === slug) ?? null;
  if (!existing && !entry) {
    console.error(`Unknown component "${slug}" -- not in the manifest and no contract file on disk.`);
    return 1;
  }
  const isIcon = forceIcon || existing?.isIcon || entry?.isIcon || false;
  const name = existing?.name ?? entry?.name ?? slug;
  const figmaNodeIds = existing?.figmaNodeIds ?? entry?.figmaNodeIds ?? [];

  const token = getFigmaAccessToken();
  if (!token) {
    console.error("FIGMA_ACCESS_TOKEN is not set.");
    return 1;
  }
  const fileKey = resolveFileKey(root);

  if (isIcon) {
    // Icons are deterministic: fetch the SVG and transform it. No LLM.
    if (figmaNodeIds.length === 0) {
      console.error(`Icon "${slug}" has no figmaNodeIds in the manifest/contract.`);
      return 1;
    }
    const svg = await fetchIconSvg(fileKey, figmaNodeIds[0], token);
    if (!svg) {
      console.error(`Figma did not return an SVG for icon "${slug}" (node ${figmaNodeIds[0]}).`);
      return 1;
    }
    const files = buildIconComponentFiles(slug, svg);
    const iconContract: ComponentContract = { props: [], cssVariables: [], classNames: [] };
    const contractFile: ComponentContractFile = {
      name, slug, isIcon: true, figmaNodeIds,
      variants: existing?.variants ?? [], states: existing?.states ?? [],
      contract: iconContract,
    };
    const result = await runValidationLoop({
      model: getCodegenModel(),
      component: { slug, name, variants: contractFile.variants, states: contractFile.states, isIcon: true, uses: [] },
      contract: iconContract,
      files: { tsx: files.tsxContent, css: files.cssContent, stories: files.storiesContent, index: files.indexContent },
      tokens: loadTokens(root),
      childContracts: new Map(),
      isIcon: true,
      componentName: files.componentName,
      fileBase: files.componentName,
      uses: [],
      typecheck: () => runPackageTypecheck(root),
      write: async (f) => { writeComponent(contractFile, toSource(slug, true, f, files), root); },
      fix: async (f) => ({ files: f, inputTokens: 0, outputTokens: 0 }), // never called for icons
    });
    writeResult(root, resultFile, {
      slug, isIcon: true, passed: result.passed, rounds: result.rounds, findings: result.findings, model: getCodegenModel(),
      inputTokens: 0, outputTokens: 0, estimatedCostUsd: 0,
    });
    return 0;
  }

  // Regular component: distill the real Figma design + composition, then generate.
  // Fail fast on a missing ANTHROPIC_API_KEY BEFORE the Figma network round-trip
  // (getAnthropicClient() throws when the key is unset).
  getAnthropicClient();
  const model = getCodegenModel();
  const tokens = loadTokens(root);
  const childContracts = loadCommittedContracts(root);
  const index = buildComponentIndex(loadAllComponentRows(root));
  const design = await fetchComponentDesignSpec(fileKey, figmaNodeIds, token, tokens, index, slug);

  const component: ComponentForCodegen = {
    slug, name,
    description: undefined,
    variants: existing?.variants ?? [],
    states: existing?.states ?? [],
    isIcon: false,
    designSpec: design?.spec,
    uses: design?.uses,
  };

  const reviewed = await generateComponentCodeReviewed(model, component, tokens, childContracts);
  const contractFile: ComponentContractFile = {
    name, slug, isIcon: false, figmaNodeIds,
    variants: component.variants, states: component.states,
    contract: reviewed.contract,
    figmaUpdatedAt: entry?.figmaUpdatedAt, // stamp the Figma version we generated from
  };

  const result = await runValidationLoop({
    model,
    component,
    contract: reviewed.contract,
    files: { tsx: reviewed.tsxContent, css: reviewed.cssContent, stories: reviewed.storiesContent, index: reviewed.indexContent },
    tokens,
    childContracts,
    isIcon: false,
    componentName: reviewed.componentName,
    fileBase: reviewed.componentName,
    uses: component.uses ?? [],
    maxRounds,
    typecheck: () => runPackageTypecheck(root),
    write: async (files) => { writeComponent(contractFile, toSource(slug, false, files, reviewed), root); },
    fix: (files, findings) => fixComponentFiles(model, component, reviewed.contract, files, findings, childContracts, tokens),
  });

  const inputTokens = reviewed.inputTokens + result.inputTokens;
  const outputTokens = reviewed.outputTokens + result.outputTokens;
  writeResult(root, resultFile, {
    slug, isIcon: false, passed: result.passed, rounds: result.rounds, findings: result.findings, model,
    inputTokens, outputTokens, estimatedCostUsd: estimateCostUsd(model, inputTokens, outputTokens),
  });
  return 0; // the workflow opens the PR; the label carries needs-human
}

async function visual(slug: string, opts: { rendered?: string; resultFile?: string }): Promise<number> {
  const root = findRepoRoot();
  const manifest = loadManifest(root);
  const existing = loadComponentContract(slug, root);
  const entry = manifest.components.find((c) => c.slug === slug) ?? manifest.icons.find((c) => c.slug === slug) ?? null;
  const isIcon = existing?.isIcon ?? entry?.isIcon ?? false;
  const nodeId = (existing?.figmaNodeIds ?? entry?.figmaNodeIds ?? [])[0] ?? "";
  const token = getFigmaAccessToken();
  const model = getCodegenModel();
  const result = await runVisualReview({
    slug,
    componentName: componentIdentifier(slug),
    fileKey: manifest.figmaFileKey ?? process.env.FIGMA_FILE_KEY ?? "",
    nodeId: token && (manifest.figmaFileKey || process.env.FIGMA_FILE_KEY) ? nodeId : "",
    token: token ?? "",
    model,
    readRendered: () => {
      if (!opts.rendered) return null;
      try { return { bytes: new Uint8Array(readFileSync(opts.rendered)), mediaType: "image/png" }; }
      catch { return null; }
    },
    fetchImage: (fk, nid, tk) => fetchNodeImage(fk, nid, tk),
    reviewDiff: (m, f, r, cn, sp) => reviewVisualDiff(m, f, r, cn, sp),
  });
  const path = opts.resultFile ?? join(root, "visual-result.json");
  writeFileSync(path, JSON.stringify(result, null, 2) + "\n");
  console.log(`visual → ${path} (ran=${result.ran}, findings=${result.findings.length})`);
  void isIcon;
  return 0; // advisory: never blocks
}

async function sync(): Promise<number> {
  const root = findRepoRoot();
  const token = getFigmaAccessToken();
  if (!token) {
    console.error("FIGMA_ACCESS_TOKEN is not set.");
    return 1;
  }
  const fileKey = process.env.FIGMA_FILE_KEY || loadManifest(root).figmaFileKey;
  if (!fileKey) {
    console.error("No Figma file key: set FIGMA_FILE_KEY or manifest.figmaFileKey.");
    return 1;
  }
  const result = await runSync({ fileKey, token }); // real deps by default
  const { written, removed, orphanedCommitted } = writeSync(result, root);
  console.log(
    `sync: ${result.components.length} components, ${result.icons.length} icons, ${result.tokens.length} tokens (${result.tokensSkipped} skipped)\n${written.length} files written, ${removed.length} orphan paths removed`,
  );
  if (orphanedCommitted.length > 0) {
    console.warn(
      `⚠ gone from Figma but has committed code (left intact): ${orphanedCommitted.join(", ")}\n` +
        `  run \`codegen delete <slug>\` for any you intend to remove.`,
    );
  }
  return 0;
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") {
    console.log(HELP);
    return 0;
  }
  if (cmd === "doctor") return doctor();
  if (cmd === "sync") return sync();
  if (cmd === "delete") {
    const slug = argv.slice(1).find((a) => !a.startsWith("-"));
    if (!slug) { console.error("delete needs a <slug>. See `codegen --help`."); return 1; }
    const changed = deleteComponent(slug);
    console.log(`delete: removed ${slug} (${changed.length} paths changed)`);
    return 0;
  }
  if (cmd === "generate") {
    const rest = argv.slice(1);
    const slug = rest.find((a) => !a.startsWith("-"));
    if (!slug) {
      console.error("generate needs a <slug>. See `codegen --help`.");
      return 1;
    }
    const mrIdx = rest.indexOf("--max-rounds");
    // Guard against a non-numeric/<1 --max-rounds: an unguarded NaN makes the
    // `rounds >= maxRounds` cap never trip -> an uncapped paid LLM fix loop.
    const mrRaw = mrIdx >= 0 ? Number(rest[mrIdx + 1]) : 3;
    const maxRounds = Number.isInteger(mrRaw) && mrRaw >= 1 ? mrRaw : 3;
    const rfIdx = rest.indexOf("--result-file");
    const resultFile = rfIdx >= 0 ? rest[rfIdx + 1] : undefined;
    return generate(slug, rest.includes("--icon"), { maxRounds, resultFile });
  }
  if (cmd === "visual") {
    const rest = argv.slice(1);
    const slug = rest.find((a) => !a.startsWith("-"));
    if (!slug) { console.error("visual needs a <slug>. See `codegen --help`."); return 1; }
    const rIdx = rest.indexOf("--rendered");
    const rendered = rIdx >= 0 ? rest[rIdx + 1] : undefined;
    const rfIdx = rest.indexOf("--result-file");
    const resultFile = rfIdx >= 0 ? rest[rfIdx + 1] : undefined;
    return visual(slug, { rendered, resultFile });
  }
  console.error(`Unknown command "${cmd}". See \`codegen --help\`.`);
  return 1;
}

main().then((code) => process.exit(code)).catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
