/**
 * Pure Figma-library curation logic -- ported from ai-tools-app's
 * src/lib/figma/sync.ts (isCuratedComponentName, stripCurationMarker,
 * isLikelyIconName, parseVariantName, buildComponentGroups/mergeIn,
 * uniqueSlug, slugKeyFor). Given a Figma library's raw list-endpoint entries
 * (GET /files/:key/components and /component_sets -- ~300 icons + hundreds
 * of noise entries + the ~30 real design-system components), decides which
 * are real components ("🟢"-marked, no "/") vs icons (page "Icons" or
 * "/"-taxonomy without "="), merges same-literal-name duplicates, and
 * assigns slugs.
 *
 * Deliberately has NO network/fs/DB coupling (no `server-only`, `@/db`,
 * drizzle): resolving a component SET's variant children (extra nodeIds +
 * variant labels, which needs a `GET .../nodes?depth=1` fetch) is I/O and
 * stays out of this module -- the caller (Task 4's runSync) resolves it and
 * passes the result in via buildComponentGroups' optional `variantsBySetId`
 * map, mirroring the source's fetchComponentGroupsFast/buildComponentGroups
 * split (I/O fetch, then a pure grouping call).
 */

import { slugify } from "./paths";
import type { DesignComponentVariant, DesignComponentState } from "./types";
import type { FigmaLibComponent } from "./figma";

/** One raw entry from Figma's /components or /component_sets list endpoints
 *  -- node_id/name/description/containing_frame.pageName. Alias of
 *  FigmaLibComponent (figma.ts) so this module doesn't redefine the wire
 *  shape, under the name this file's callers think in terms of. */
export type RawComp = FigmaLibComponent;

/** A component SET's already-resolved variant child (id + raw Figma name,
 *  e.g. from `GET /files/:key/nodes?ids=...&depth=1`'s `.children`). Passed
 *  in by the caller -- see buildComponentGroups' `variantsBySetId` param. */
export interface RawVariantChild {
  id: string;
  name: string;
}

export interface ResolvedComponentGroup {
  slug: string;
  name: string;
  description?: string;
  figmaNodeIds: string[];
  variants: DesignComponentVariant[];
  states: DesignComponentState[];
  isIcon: boolean;
}

/** "Size=Large, State=Hover" -> [{key:"Size",value:"Large"},{key:"State",value:"Hover"}]. Not an
 *  officially-documented format (Figma's editor generates it, but no spec pins the syntax down) --
 *  falls back to treating the whole name as one variant if it doesn't match. */
export function parseVariantName(name: string): { key: string; value: string }[] | null {
  const parts = name.split(",").map((p) => p.trim());
  const pairs = parts.map((p) => {
    const idx = p.indexOf("=");
    return idx === -1 ? null : { key: p.slice(0, idx).trim(), value: p.slice(idx + 1).trim() };
  });
  return pairs.every((p) => p !== null) ? (pairs as { key: string; value: string }[]) : null;
}

/**
 * Best-effort "is this a single icon rather than a real UI component"
 * heuristic -- Figma's API has no dedicated field for this, so it's
 * inferred from naming conventions:
 *
 * 1. It lives on a page/frame whose name contains "icon" (e.g. a page
 *    literally called "Icons") -- containing_frame.pageName, only
 *    available from the fast path's lightweight listing endpoints.
 * 2. Its own name uses "/"-separated hierarchical segments (e.g.
 *    "Outline/Regular/Plus", a common Figma icon-library convention --
 *    confirmed against a real icon set). Figma's own auto-generated
 *    variant-name syntax never uses "/" (it's "Key=Value, Key2=Value2",
 *    see parseVariantName), so this can't misfire on a real variant name.
 *
 * Either signal is enough. If this misclassifies something in a particular
 * Figma file, it shows up immediately as a component sitting in the wrong
 * tab -- easy to spot and report back, versus silently guessing wrong
 * forever.
 */
export function isLikelyIconName(name: string, pageLabel: string | undefined): boolean {
  // Match a page literally named "Icons"/"Icon" (word-boundary) -- NOT a
  // substring, so a component whose page is "ButtonIcon" (that's IconButton!)
  // isn't mistaken for an icon.
  if (pageLabel && /\bicons?\b/i.test(pageLabel)) return true;
  // A "/"-hierarchical name is the icon-library convention (Outline/Bold/Plus,
  // Fill/Profile2) -- BUT Figma's own variant-name syntax is "Key=Value,
  // Key2=Value2", and a value can itself contain "/" (e.g. a real component's
  // variant "Type=Number, ..., Filter/Sort=Off"). Those are NOT icons, so a
  // name that contains "=" is a variant name, never an icon.
  return name.includes("/") && !name.includes("=");
}

// Curated design-system components are marked with a leading "🟢" in the
// Figma file. The marker is on the top-level SET (or standalone component)
// with a simple name ("🟢 Avatar"); individual published variants/showcase
// copies get a "/"-path name ("🟢 Avatar/Dark/40 px/Img/Off") and are NOT
// real components -- so a curated component is "🟢" AND has no "/".
const CURATION_MARKER = "🟢";

export function stripCurationMarker(name: string): string {
  return name.replace(/^\s*🟢\s*/u, "").trim();
}

export function isCuratedComponentName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.startsWith(CURATION_MARKER) && !stripCurationMarker(trimmed).includes("/");
}

function slugKeyFor(name: string): string {
  return name.trim();
}

/** Appends "-2"/"-3"/... to `base` until it's not in `taken`, then reserves
 *  it in `taken` (mutates the set) -- shared dedup used by
 *  buildComponentGroups' slug assignment pass. */
export function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  taken.add(slug);
  return slug;
}

/** Parses a component SET's already-resolved variant children into its
 *  variants/states -- mirrors sync.ts's inline loop shared by
 *  buildComponentGroups and resyncComponentFromFigma. */
function parseVariantChildren(
  children: RawVariantChild[],
): { variants: DesignComponentVariant[]; states: DesignComponentState[] } {
  const variantMap = new Map<string, DesignComponentVariant>();
  const stateMap = new Map<string, DesignComponentState>();
  for (const child of children) {
    const pairs = parseVariantName(child.name);
    if (!pairs) {
      variantMap.set(child.name, { name: child.name });
      continue;
    }
    for (const { key, value } of pairs) {
      if (/state/i.test(key)) {
        stateMap.set(value, { name: value });
      } else {
        const label = `${key}: ${value}`;
        variantMap.set(label, { name: label });
      }
    }
  }
  return { variants: Array.from(variantMap.values()), states: Array.from(stateMap.values()) };
}

/**
 * Figma allows multiple, entirely distinct component sets/standalone
 * components to share the same literal name (e.g. a dozen "Tooltip"
 * entries, one per theme/placement, each never using Figma's own
 * Component Set/Variants feature to tie them together) -- confirmed
 * against a real synced file. Rather than keeping those as separate rows,
 * same-name entries are merged into ONE group here: their variants/states
 * union via a Map keyed by label (so an identical variant/state coming
 * from two merged entries collapses into one, never duplicating), and
 * their figmaNodeIds union via a Set. This is intentionally a
 * literal-name match only -- it won't catch e.g. "Button Primary" /
 * "Button Secondary" (different names, not expressed as Figma variants of
 * one shared component) -- that case needs a person's judgment call.
 *
 * `sets`/`comps` are the raw LIST-endpoint entries (node_id/name/
 * description/containing_frame.pageName only) -- resolving a SET's variant
 * children is I/O (`GET .../nodes?depth=1`), so it does NOT happen here.
 * If the caller has already resolved a set's children (Task 4's runSync
 * always does, before calling this), pass them via `variantsBySetId`
 * (set's node_id -> children); a set missing from the map is treated as
 * having no variants/states of its own (still grouped/curated by name).
 */
export function buildComponentGroups(
  sets: RawComp[],
  comps: RawComp[],
  variantsBySetId?: Map<string, RawVariantChild[]>,
): ResolvedComponentGroup[] {
  const byName = new Map<string, ResolvedComponentGroup>();
  const order: string[] = [];

  const mergeIn = (
    name: string,
    description: string | undefined,
    figmaNodeIds: string[],
    variants: DesignComponentVariant[],
    states: DesignComponentState[],
    isIcon: boolean,
  ) => {
    const key = slugKeyFor(name);
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, { slug: "", name: key, description, figmaNodeIds: [...figmaNodeIds], variants, states, isIcon });
      order.push(key);
      return;
    }

    const variantMap = new Map(existing.variants.map((v) => [v.name, v]));
    for (const v of variants) if (!variantMap.has(v.name)) variantMap.set(v.name, v);
    const stateMap = new Map(existing.states.map((s) => [s.name, s]));
    for (const s of states) if (!stateMap.has(s.name)) stateMap.set(s.name, s);

    existing.variants = Array.from(variantMap.values());
    existing.states = Array.from(stateMap.values());
    existing.figmaNodeIds = Array.from(new Set([...existing.figmaNodeIds, ...figmaNodeIds]));
    existing.description = existing.description || description;
    existing.isIcon = existing.isIcon || isIcon;
  };

  for (const set of sets) {
    const children = variantsBySetId?.get(set.node_id) ?? [];
    const { variants, states } = parseVariantChildren(children);
    mergeIn(
      set.name,
      set.description,
      [set.node_id, ...children.map((c) => c.id)],
      variants,
      states,
      isLikelyIconName(set.name, set.containing_frame?.pageName),
    );
  }

  for (const component of comps) {
    mergeIn(
      component.name,
      component.description,
      [component.node_id],
      [],
      [],
      isLikelyIconName(component.name, component.containing_frame?.pageName),
    );
  }

  const usedSlugs = new Set<string>();

  return order
    .map((key) => byName.get(key)!)
    // Keep only real design-system components (curated with "🟢") and icons.
    // Drops the noise entries Figma's library endpoints return --
    // individually-published variants, showcase/documentation copies, and
    // internal/deprecated components.
    .filter((group) => group.isIcon || isCuratedComponentName(group.name))
    .map((group) => {
      group.slug = uniqueSlug(slugify(group.name), usedSlugs);
      group.name = stripCurationMarker(group.name); // store the clean display name, without the marker
      return group;
    });
}
