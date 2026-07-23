import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { generateTokensCss, type TokenForCss } from "./tokens";
import type {
  DesignTokenCategory,
  DesignComponentVariant,
  DesignComponentState,
  StoredComponentContract,
} from "./types";
import { componentSourcePaths, type GeneratedComponentFiles } from "./paths";

export const MANIFEST_FILE = "design-system.manifest.json";
export const TOKENS_FILE = join("tokens", "tokens.json");
const COMPONENTS_ROOT = join("packages", "components", "src");
const TOKENS_CSS_REL = join("packages", "components", "src", "tokens", "tokens.css");

export interface ManifestEntry {
  name: string;
  slug: string;
  isIcon: boolean;
  figmaNodeIds: string[];
  figmaUpdatedAt?: string; // current Figma updated_at (sync writes it every run)
}

export interface Manifest {
  components: ManifestEntry[];
  icons: ManifestEntry[];
  figmaFileKey?: string;
}

/** The on-disk <slug>.contract.json shape (see docs/design-system-admin/conventions.md). */
export interface ComponentContractFile {
  name: string;
  slug: string;
  isIcon: boolean;
  figmaNodeIds: string[];
  variants: DesignComponentVariant[];
  states: DesignComponentState[];
  contract: StoredComponentContract;
  figmaUpdatedAt?: string; // the Figma updated_at this code was GENERATED FROM
}

/** Walk up from `start` to the monorepo root (the dir holding the manifest). */
export function findRepoRoot(start: string = process.cwd()): string {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, MANIFEST_FILE))) return dir;
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`Could not find ${MANIFEST_FILE} walking up from ${start}`);
    dir = parent;
  }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function loadManifest(root: string = findRepoRoot()): Manifest {
  const m = readJson<Partial<Manifest>>(join(root, MANIFEST_FILE));
  return { components: m.components ?? [], icons: m.icons ?? [], figmaFileKey: m.figmaFileKey };
}

export function loadTokens(root: string = findRepoRoot()): TokenForCss[] {
  const raw = readJson<Record<string, { category: string; value: string }>>(join(root, TOKENS_FILE));
  return Object.entries(raw).map(([name, meta]) => ({
    name,
    category: meta.category as DesignTokenCategory,
    value: meta.value,
  }));
}

export function writeManifest(manifest: Manifest, root: string = findRepoRoot()): void {
  writeFileSync(join(root, MANIFEST_FILE), JSON.stringify(manifest, null, 2) + "\n");
}

/** Wholesale-write tokens.json ({name:{category,value}}) + regenerate tokens.css. */
export function writeTokensJson(tokens: TokenForCss[], root: string = findRepoRoot()): void {
  const obj: Record<string, { category: string; value: string }> = {};
  for (const t of tokens) obj[t.name] = { category: t.category, value: t.value };
  writeFileSync(join(root, TOKENS_FILE), JSON.stringify(obj, null, 2) + "\n");
  const cssPath = join(root, TOKENS_CSS_REL);
  mkdirSync(dirname(cssPath), { recursive: true });
  writeFileSync(cssPath, generateTokensCss(tokens));
}

/** Write/merge a component's seed contract, PRESERVING an existing generated
 *  `contract` block (props/cssVariables/classNames) AND its `figmaUpdatedAt`
 *  generated-from stamp -- a re-sync's fresh seed carries neither, so the
 *  existing value always wins. Only metadata (name/variants/states/etc.) is
 *  updated. */
export function writeSeedContract(entry: ComponentContractFile, root: string = findRepoRoot()): string {
  const existing = loadComponentContract(entry.slug, root);
  const merged: ComponentContractFile = {
    ...entry,
    contract: existing?.contract ?? entry.contract,
    figmaUpdatedAt: existing?.figmaUpdatedAt ?? entry.figmaUpdatedAt,
  };
  const dir = join(root, "packages", "components", componentSourcePaths(entry.slug, entry.isIcon).dir);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${entry.slug}.contract.json`);
  writeFileSync(path, JSON.stringify(merged, null, 2) + "\n");
  return path;
}

function componentDir(slug: string, isIcon: boolean, root: string): string {
  return join(root, COMPONENTS_ROOT, isIcon ? "icons" : "components", slug);
}

/** Load one component's contract file, searching components/ then icons/. */
export function loadComponentContract(slug: string, root: string = findRepoRoot()): ComponentContractFile | null {
  for (const isIcon of [false, true]) {
    const path = join(componentDir(slug, isIcon, root), `${slug}.contract.json`);
    if (existsSync(path)) return readJson<ComponentContractFile>(path);
  }
  return null;
}

/** Every committed component's persisted contract (props/types/tokens/classes),
 *  keyed by slug -- the composition-grounding source (was: committed DB rows). */
export function loadCommittedContracts(root: string = findRepoRoot()): Map<string, StoredComponentContract> {
  const out = new Map<string, StoredComponentContract>();
  const manifest = loadManifest(root);
  for (const entry of [...manifest.components, ...manifest.icons]) {
    const file = loadComponentContract(entry.slug, root);
    if (file) out.set(entry.slug, file.contract);
  }
  return out;
}

/** Rows for buildComponentIndex / dependencyClosure -- from the manifest. */
export function loadAllComponentRows(
  root: string = findRepoRoot(),
): { slug: string; figmaNodeIds: string[]; isIcon: boolean }[] {
  const manifest = loadManifest(root);
  return [...manifest.components, ...manifest.icons].map((e) => ({
    slug: e.slug,
    figmaNodeIds: e.figmaNodeIds ?? [],
    isIcon: e.isIcon,
  }));
}

/**
 * Write a generated component to the working tree: the 4 source files + its
 * <slug>.contract.json, honoring `deletePaths` (stale legacy files from a
 * previous name). Paths in `files` are relative to packages/components (e.g.
 * "src/components/<slug>/<Name>.tsx"); we prepend the package root. Returns the
 * absolute paths written.
 */
export function writeComponent(
  contractFile: ComponentContractFile,
  files: GeneratedComponentFiles,
  root: string = findRepoRoot(),
): string[] {
  const pkgRoot = join(root, "packages", "components");
  const abs = (rel: string) => join(pkgRoot, rel);
  const write = (rel: string, content: string): string => {
    const path = abs(rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    return path;
  };
  // Remove stale legacy files first (e.g. an old pascalCase name).
  for (const rel of files.deletePaths) {
    const path = abs(rel);
    if (existsSync(path)) rmSync(path);
  }
  const written = [
    write(files.tsxPath, files.tsxContent),
    write(files.cssPath, files.cssContent),
    write(files.storiesPath, files.storiesContent),
    write(files.indexPath, files.indexContent),
  ];
  const paths = componentSourcePaths(contractFile.slug, contractFile.isIcon);
  const contractPath = join(paths.dir, `${contractFile.slug}.contract.json`);
  written.push(write(contractPath, JSON.stringify(contractFile, null, 2) + "\n"));
  // Register the component in the root barrel so it is part of the published
  // package's public API. Idempotent (a regenerate won't duplicate); the delete
  // command removes the same lines.
  const barrelChanged = ensureBarrelExport(contractFile.slug, contractFile.isIcon, root);
  if (barrelChanged) written.push(barrelChanged);
  return written;
}

/**
 * Ensure the root barrel (`packages/components/src/index.ts`) re-exports a
 * component -- `export { Name } from "./<kind>/<slug>"` plus the matching
 * `export type { NameProps }`. Idempotent: returns null (writes nothing) when
 * the component is already exported. Returns the barrel path when it appends.
 * Symmetric to `deleteComponent`'s barrel removal (same trailing-quote marker,
 * so `button` never matches `button-group`).
 */
export function ensureBarrelExport(
  slug: string,
  isIcon: boolean,
  root: string = findRepoRoot(),
): string | null {
  const barrelPath = join(root, COMPONENTS_ROOT, "index.ts");
  const { componentName } = componentSourcePaths(slug, isIcon);
  const rel = `./${isIcon ? "icons" : "components"}/${slug}`;
  const existing = existsSync(barrelPath) ? readFileSync(barrelPath, "utf8") : "";
  if (existing.includes(`${rel}"`)) return null; // already exported
  const additions =
    `export { ${componentName} } from "${rel}";\n` +
    `export type { ${componentName}Props } from "${rel}";\n`;
  const base = existing === "" || existing.endsWith("\n") ? existing : existing + "\n";
  writeFileSync(barrelPath, base + additions);
  return barrelPath;
}
