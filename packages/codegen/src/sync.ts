/**
 * The Figma metadata sync orchestrator: fetches a library's raw component/
 * component-set/style listings, resolves component-SET variant children and
 * style nodes (one batched `nodes?depth=1` call), curates them into real
 * design-system components + icons (sync-curate.ts), harvests design tokens
 * (Figma Styles via sync-tokens.ts, "wins" on a name collision; derived
 * colors/radii via token-derive.ts as a fallback for Variables-only files),
 * and maps the result into ManifestEntry + seed ComponentContractFile rows.
 *
 * All Figma I/O is INJECTED via `deps` (defaulting to the real figma.ts /
 * token-derive.ts calls) so `runSync` is unit-testable with fakes -- no
 * network in tests. `writeSync` is the separate, dumb "persist this result"
 * half (loaders.ts's write helpers) -- kept apart so runSync stays a pure
 * async computation callers can inspect/assert on before anything touches disk.
 */

import {
  getFileComponents,
  getFileComponentSets,
  getFileStyles,
  getFileNodesShallow,
  type FigmaLibComponent,
  type FigmaLibStyle,
} from "./figma";
import {
  buildComponentGroups,
  type RawVariantChild,
  type ResolvedComponentGroup,
} from "./sync-curate";
import {
  resolveStyleToken,
  type FigmaPaint,
  type FigmaTypeStyle,
  type FigmaEffect,
} from "./sync-tokens";
import { deriveTokensFromComponents, type DeriveTokensResult } from "./token-derive";
import type { TokenForCss } from "./tokens";
import { join } from "node:path";
import {
  loadManifest,
  writeManifest,
  writeTokensJson,
  writeSeedContract,
  findRepoRoot,
  MANIFEST_FILE,
  TOKENS_FILE,
  type ManifestEntry,
  type ComponentContractFile,
} from "./loaders";

const TOKENS_CSS_REL = join("packages", "components", "src", "tokens", "tokens.css");

// ---- injected node-resolution shape ----

/** A node as resolved by a shallow (`depth=1`, no geometry) nodes fetch --
 *  enough to read a component SET's variant children (id/name) AND a
 *  style's own fill/text/effect (for sync-tokens' resolveStyleToken). */
export interface ResolvedNode {
  id: string;
  name: string;
  children?: { id: string; name: string }[];
  fills?: FigmaPaint[];
  style?: FigmaTypeStyle;
  effects?: FigmaEffect[];
}

export type ResolveNodesFn = (
  fileKey: string,
  nodeIds: string[],
  accessToken: string,
) => Promise<Record<string, ResolvedNode | null | undefined>>;

interface RawNodesResponse {
  nodes: Record<string, { document: ResolvedNode } | null>;
}

// Figma's nodes endpoint rejects overly large id lists -- batch generously (250
// ids/request) and run a few batches concurrently, mirroring token-derive.ts's
// batching so a library with many sets/styles can't stall (or blow the
// request timeout on) a single giant request.
const NODES_BATCH = 250;
const NODES_CONCURRENCY = 3;

/** Default `resolveNodes`: a real, batched `GET .../nodes?depth=1` (shallow --
 *  no geometry) sweep over `getFileNodesShallow`. */
async function defaultResolveNodes(
  fileKey: string,
  nodeIds: string[],
  accessToken: string,
): Promise<Record<string, ResolvedNode | null | undefined>> {
  const out: Record<string, ResolvedNode | null | undefined> = {};
  if (nodeIds.length === 0) return out;

  const batches: string[][] = [];
  for (let i = 0; i < nodeIds.length; i += NODES_BATCH) batches.push(nodeIds.slice(i, i + NODES_BATCH));

  for (let i = 0; i < batches.length; i += NODES_CONCURRENCY) {
    const wave = batches.slice(i, i + NODES_CONCURRENCY);
    const responses = await Promise.all(
      wave.map((batch) =>
        getFileNodesShallow<RawNodesResponse>(fileKey, batch, accessToken, 1).catch(() => null),
      ),
    );
    for (const res of responses) {
      if (!res) continue;
      for (const [id, entry] of Object.entries(res.nodes)) out[id] = entry?.document;
    }
  }
  return out;
}

// ---- injected Figma I/O ----

export interface SyncDeps {
  getComponents: (fileKey: string, accessToken: string) => Promise<FigmaLibComponent[]>;
  getComponentSets: (fileKey: string, accessToken: string) => Promise<FigmaLibComponent[]>;
  getStyles: (fileKey: string, accessToken: string) => Promise<FigmaLibStyle[]>;
  resolveNodes: ResolveNodesFn;
  deriveTokens: (
    rows: { figmaNodeIds: string[]; isIcon: boolean }[],
    fileKey: string,
    accessToken: string,
  ) => Promise<DeriveTokensResult>;
}

const defaultDeps: SyncDeps = {
  getComponents: getFileComponents,
  getComponentSets: getFileComponentSets,
  getStyles: getFileStyles,
  resolveNodes: defaultResolveNodes,
  deriveTokens: deriveTokensFromComponents,
};

export interface RunSyncArgs {
  fileKey: string;
  token: string;
  deps?: Partial<SyncDeps>;
}

export interface SyncResult {
  components: ManifestEntry[];
  icons: ManifestEntry[];
  contracts: ComponentContractFile[];
  tokens: TokenForCss[];
  tokensSkipped: number;
}

function toManifestEntry(group: ResolvedComponentGroup): ManifestEntry {
  return { name: group.name, slug: group.slug, isIcon: group.isIcon, figmaNodeIds: group.figmaNodeIds };
}

function toSeedContract(group: ResolvedComponentGroup): ComponentContractFile {
  return {
    name: group.name,
    slug: group.slug,
    isIcon: group.isIcon,
    figmaNodeIds: group.figmaNodeIds,
    variants: group.variants,
    states: group.states,
    contract: { props: [], cssVariables: [], classNames: [] },
  };
}

/**
 * Fetch -> resolve -> curate -> harvest tokens -> map. THROWS if the curated
 * result is empty (SAFETY INVARIANT: an empty result must never reach
 * writeSync, which would otherwise wipe the committed manifest down to
 * nothing on a bad/misconfigured Figma file).
 */
export async function runSync(args: RunSyncArgs): Promise<SyncResult> {
  const deps: SyncDeps = { ...defaultDeps, ...args.deps };
  const { fileKey, token: accessToken } = args;

  const [comps, sets, styles] = await Promise.all([
    deps.getComponents(fileKey, accessToken),
    deps.getComponentSets(fileKey, accessToken),
    // Tokens are optional -- a styles-list hiccup must not fail the whole sync.
    deps.getStyles(fileKey, accessToken).catch(() => []),
  ]);

  const setIds = sets.map((s) => s.node_id);
  const styleNodeIds = styles.map((s) => s.node_id);
  const resolved = await deps.resolveNodes(fileKey, [...setIds, ...styleNodeIds], accessToken);

  const variantsBySetId = new Map<string, RawVariantChild[]>();
  for (const id of setIds) {
    const children = resolved[id]?.children ?? [];
    variantsBySetId.set(id, children.map((c) => ({ id: c.id, name: c.name })));
  }

  const groups = buildComponentGroups(sets, comps, variantsBySetId);
  const componentGroups = groups.filter((g) => !g.isIcon);
  const iconGroups = groups.filter((g) => g.isIcon);

  // SAFETY INVARIANT 1: non-empty ABORT guard -- never let a Figma hiccup (auth
  // failure, wrong file key, temporarily-empty library) curate down to nothing
  // and silently wipe the manifest via writeSync.
  if (componentGroups.length + iconGroups.length === 0) {
    throw new Error(
      `runSync: curated result is empty (0 components + 0 icons) for file ${fileKey} -- aborting instead of ` +
        "writing an empty manifest (this would wipe every existing component/icon entry)",
    );
  }

  // ---- tokens: Style tokens (harvested), then derived colors/radii fill gaps ----
  const styleTokens: TokenForCss[] = [];
  let tokensSkipped = 0;
  for (const style of styles) {
    const node = resolved[style.node_id];
    // figma.ts's FigmaLibStyle uses snake_case `style_type`; sync-tokens'
    // resolveStyleToken expects camelCase `styleType` -- map it here.
    const token = node ? resolveStyleToken({ name: style.name, styleType: style.style_type }, node) : null;
    if (token) styleTokens.push(token);
    else tokensSkipped++;
  }

  const nonIconRows = componentGroups.map((g) => ({ figmaNodeIds: g.figmaNodeIds, isIcon: g.isIcon }));
  const derived = await deps.deriveTokens(nonIconRows, fileKey, accessToken);

  // Dedupe by name: Style tokens WIN over derived tokens on a collision (an
  // authored Style is a more intentional source than a harvested-from-usage
  // color/radius).
  const tokenByName = new Map<string, TokenForCss>();
  for (const t of derived.tokens) tokenByName.set(t.name, t);
  for (const t of styleTokens) tokenByName.set(t.name, t);

  return {
    components: componentGroups.map(toManifestEntry),
    icons: iconGroups.map(toManifestEntry),
    contracts: groups.map(toSeedContract),
    tokens: Array.from(tokenByName.values()),
    tokensSkipped,
  };
}

/** Persists a runSync result: manifest (preserving the existing
 *  figmaFileKey), tokens.json + tokens.css, and each component's seed
 *  contract (which PRESERVES any already-generated `contract` block).
 *  Returns every path written. */
export function writeSync(result: SyncResult, root: string = findRepoRoot()): string[] {
  const written: string[] = [];

  const existing = loadManifest(root);
  writeManifest({ figmaFileKey: existing.figmaFileKey, components: result.components, icons: result.icons }, root);
  written.push(join(root, MANIFEST_FILE));

  writeTokensJson(result.tokens, root);
  written.push(join(root, TOKENS_FILE), join(root, TOKENS_CSS_REL));

  for (const contract of result.contracts) written.push(writeSeedContract(contract, root));

  return written;
}
