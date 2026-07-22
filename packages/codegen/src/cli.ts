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
import { generateComponentCodeReviewed, type ComponentForCodegen } from "./component";
import { buildIconComponentFiles } from "./icon";
import { fetchIconSvg } from "./icon-fetch";

const HELP = `codegen -- design-system component generator

Usage:
  codegen generate <slug> [--icon]   Distill the Figma node and generate the
                                     component's tsx/scss/stories/index +
                                     <slug>.contract.json into packages/components.
  codegen doctor                     Check env + manifest presence (no network).
  codegen --help                     Show this help.

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

async function generate(slug: string, forceIcon: boolean): Promise<number> {
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
    const contractFile: ComponentContractFile = {
      name, slug, isIcon: true, figmaNodeIds,
      variants: existing?.variants ?? [], states: existing?.states ?? [],
      contract: { props: [], cssVariables: [], classNames: [] },
    };
    const written = writeComponent(contractFile, files, root);
    console.log(`Wrote icon ${slug}:\n${written.map((p) => `  ${p}`).join("\n")}`);
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
  };
  const written = writeComponent(contractFile, reviewed, root);
  console.log(
    `Wrote ${slug} (review ${reviewed.reviewPassed ? "PASSED" : "did NOT pass"}, ` +
      `${reviewed.reviewFindings.length} findings):\n${written.map((p) => `  ${p}`).join("\n")}`,
  );
  return reviewed.reviewPassed ? 0 : 2;
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") {
    console.log(HELP);
    return 0;
  }
  if (cmd === "doctor") return doctor();
  if (cmd === "generate") {
    const slug = argv.slice(1).find((a) => !a.startsWith("-"));
    if (!slug) {
      console.error("generate needs a <slug>. See `codegen --help`.");
      return 1;
    }
    return generate(slug, argv.includes("--icon"));
  }
  console.error(`Unknown command "${cmd}". See \`codegen --help\`.`);
  return 1;
}

main().then((code) => process.exit(code)).catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
