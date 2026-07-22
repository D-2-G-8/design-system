import { getFileNodesShallow, describeFigmaError } from "./figma";
import { solidFill, radiusOf, type FigmaNode, type FigmaNodesResponse } from "./figma-node";
import { toCssVarName, type TokenForCss } from "./tokens";

/**
 * Derives design tokens from how the real components are actually drawn, for the
 * common case where a file's tokens live as Figma **Variables** (Enterprise-only
 * API + scope, so unreachable here) rather than legacy **Styles** -- which is
 * why the Styles-only sync produced an empty tokens.css. Instead of reading a
 * token registry that isn't accessible, we harvest the distinct colors and
 * corner radii the curated components USE (their node subtrees), and register
 * each as a token. Components then reference them via var(--...) (the codegen
 * distiller already annotates each fill with its matching token -- see
 * figma-node.ts's withToken), so a resync updates every component at once,
 * exactly as if the values had come from a proper variable collection.
 *
 * Names are value-derived and stable (`color-1a1a1a`, `radius-8`), NOT
 * positional -- so adding a new color later doesn't renumber and break existing
 * references. Semantics are weaker than authored variable names (there's no
 * "surface-primary" intent to read), but the values are real and centralized,
 * which was the accepted trade-off.
 */

// Bound the crawl so a few dozen components with deep variant trees can't blow
// up the sync request. Two independent guards:
//  - the FETCH is depth-limited and geometry-free (getFileNodesShallow), so the
//    network payload stays small -- a FULL subtree + geometry is ~52MB for this
//    file and times the request out (see sync.ts fetchNodesBatched's note); and
//  - an overall wall-clock BUDGET, so even if Figma is slow the derivation
//    stops early with a partial palette rather than starving the metadata sync.
// FETCH_DEPTH reaches the styled leaves (set -> variant -> frame -> element ->
// shape/text); MAX_DEPTH mirrors it for the in-memory walk.
const FETCH_DEPTH = 4;
const MAX_DEPTH = 4;
const MAX_NODES = 8000;
const NODES_BATCH = 5;
// Fetch batches concurrently -- Figma's per-request latency is dominated by its
// server-side tree serialization (a depth-4 batch takes seconds regardless of
// size), so running a few in parallel cuts wall-clock several-fold and keeps the
// whole derivation well inside the sync budget.
const FETCH_CONCURRENCY = 4;
const PER_BATCH_TIMEOUT_MS = 15_000;
const OVERALL_BUDGET_MS = 25_000;

interface Harvested {
  /** css color value -> a Figma node id it appeared on (for figma_node_id). */
  colors: Map<string, string>;
  /** radius px number -> a Figma node id it appeared on. */
  radii: Map<number, string>;
}

function walk(node: FigmaNode, acc: Harvested, budget: { n: number }, depth: number): void {
  if (budget.n >= MAX_NODES) return;
  budget.n++;

  const fill = solidFill(node.fills);
  if (fill && !acc.colors.has(fill)) acc.colors.set(fill, node.id);
  const stroke = solidFill(node.strokes);
  if (stroke && !acc.colors.has(stroke)) acc.colors.set(stroke, node.id);

  // radiusOf returns "8px" or "8/8/0/0px" for asymmetric corners; only harvest
  // the simple uniform case (a single number) as a radius token.
  const r = radiusOf(node);
  if (r) {
    const m = r.match(/^(\d+(?:\.\d+)?)px$/);
    if (m) {
      const px = Number(m[1]);
      if (px > 0 && !acc.radii.has(px)) acc.radii.set(px, node.id);
    }
  }

  if (depth < MAX_DEPTH && node.children) {
    for (const child of node.children) walk(child, acc, budget, depth + 1);
  }
}

/** A CSS color like "#1A2B3C" / "rgba(0,0,0,0.5)" -> a stable token name. */
function colorTokenName(value: string): string {
  // toCssVarName lowercases and turns non-alnum runs into "-", so
  // "#1A2B3C" -> "color-1a2b3c" and "rgba(0,0,0,0.5)" -> "color-rgba-0-0-0-0-5".
  return `color-${toCssVarName(value)}`;
}

export interface DeriveTokensResult {
  tokens: TokenForCss[];
  colors: number;
  radii: number;
}

/**
 * Harvests tokens from the given curated component rows' Figma subtrees.
 * Returns the harvested token list plus how many of each kind were found.
 * Persistence (upsert/prune) is the caller's job. Best-effort: the caller
 * should wrap this so a Figma hiccup here never fails the sync it augments.
 */
export async function deriveTokensFromComponents(
  rows: { figmaNodeIds: string[]; isIcon: boolean }[],
  fileKey: string,
  accessToken: string,
): Promise<DeriveTokensResult> {
  // Real UI components only -- icons are monochrome glyphs whose single fill is
  // now `currentColor` in code anyway (see icon.ts), so they'd only contribute
  // noise like a stray pure black.
  const components = rows.filter((r) => !r.isIcon);

  const rootIds = components.map((c) => c.figmaNodeIds[0]).filter((id): id is string => Boolean(id));
  if (rootIds.length === 0) return { tokens: [], colors: 0, radii: 0 };

  const batches: string[][] = [];
  for (let i = 0; i < rootIds.length; i += NODES_BATCH) batches.push(rootIds.slice(i, i + NODES_BATCH));

  const acc: Harvested = { colors: new Map(), radii: new Map() };
  const budget = { n: 0 };
  const deadline = Date.now() + OVERALL_BUDGET_MS;

  // Run batches in concurrent waves, stopping early if the node budget or the
  // wall-clock deadline is hit -- so the derivation degrades to a partial
  // palette rather than ever stalling the metadata sync it augments.
  for (let i = 0; i < batches.length; i += FETCH_CONCURRENCY) {
    if (budget.n >= MAX_NODES || Date.now() >= deadline) break;
    const wave = batches.slice(i, i + FETCH_CONCURRENCY);
    const responses = await Promise.all(
      wave.map((batch) =>
        // Shallow + geometry-free so payloads stay small; short per-batch
        // timeout so one slow component can't stall the sync. A failed batch
        // just contributes nothing.
        getFileNodesShallow<FigmaNodesResponse>(fileKey, batch, accessToken, FETCH_DEPTH, PER_BATCH_TIMEOUT_MS).catch(
          (err) => {
            console.warn(`[figma-sync] token-derive batch failed (partial palette kept): ${describeFigmaError(err)}`);
            return null;
          },
        ),
      ),
    );
    for (const res of responses) {
      if (!res) continue;
      for (const entry of Object.values(res.nodes)) {
        if (entry?.document) walk(entry.document, acc, budget, 0);
      }
    }
  }

  const tokens: TokenForCss[] = [];

  for (const value of acc.colors.keys()) {
    const name = colorTokenName(value);
    if (!toCssVarName(name)) continue;
    tokens.push({ name, category: "color", value });
  }
  for (const px of acc.radii.keys()) {
    const name = `radius-${px}`;
    tokens.push({ name, category: "radius", value: `${px}px` });
  }

  return { tokens, colors: acc.colors.size, radii: acc.radii.size };
}
