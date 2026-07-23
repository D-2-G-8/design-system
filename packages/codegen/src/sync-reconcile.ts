/**
 * Orphan reconcile for sync + the change-detection staleness predicate.
 *
 * An orphan = a slug present in the OLD manifest but absent from the freshly
 * curated result. Sync auto-removes only SEED-ONLY orphans (never generated);
 * an orphan WITH committed code is reported for a deliberate `codegen delete`,
 * never silently destroyed. Pure `findOrphans` (fs check injected) so it's
 * unit-testable without disk.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { findRepoRoot, type ManifestEntry } from "./loaders";
import { componentSourcePaths } from "./paths";

export type OrphanRef = { slug: string; isIcon: boolean };

/** True if the component's generated .tsx exists on disk (i.e. real code, not a
 *  never-generated seed). A seed on disk is only `<slug>.contract.json`. */
export function hasGeneratedCode(slug: string, isIcon: boolean, root: string = findRepoRoot()): boolean {
  const { tsxPath } = componentSourcePaths(slug, isIcon);
  return existsSync(join(root, "packages", "components", tsxPath));
}

/** Classify vanished components. `removable` = seed-only orphans (safe to
 *  delete). `committed` = orphans with generated code (report, don't delete). */
export function findOrphans(
  oldManifest: { components: ManifestEntry[]; icons: ManifestEntry[] },
  next: { components: { slug: string }[]; icons: { slug: string }[] },
  hasCode: (slug: string, isIcon: boolean) => boolean,
): { removable: OrphanRef[]; committed: string[] } {
  const nextSlugs = new Set([...next.components, ...next.icons].map((e) => e.slug));
  const removable: OrphanRef[] = [];
  const committed: string[] = [];
  for (const e of [...oldManifest.components, ...oldManifest.icons]) {
    if (nextSlugs.has(e.slug)) continue;
    if (hasCode(e.slug, e.isIcon)) committed.push(e.slug);
    else removable.push({ slug: e.slug, isIcon: e.isIcon });
  }
  return { removable, committed };
}

/** A component is stale iff the manifest's current Figma updated_at and the
 *  contract's generated-from updated_at are BOTH set and differ. Undefined on
 *  either side (legacy/unstamped) => not stale (no false positives). */
export function isFigmaStale(current: string | undefined, generatedFrom: string | undefined): boolean {
  return !!current && !!generatedFrom && current !== generatedFrom;
}
