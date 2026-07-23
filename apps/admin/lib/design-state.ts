import { getFileContent, listTree, listOpenCodegenPRs, listOpenDeletePRs } from "./github";
import { committedSlugsFromTree } from "./committed";

export interface ComponentState {
  slug: string;
  name: string;
  isIcon: boolean;
  status: "committed" | "pending" | "never";
  prUrl?: string;
  deletePrUrl?: string;
  stale?: boolean;
}

interface ManifestEntry { slug: string; name: string; isIcon: boolean; figmaUpdatedAt?: string }
interface Manifest { components: ManifestEntry[]; icons: ManifestEntry[] }

/** Mirrors codegen's isFigmaStale: stale iff both set and differ. */
function isFigmaStale(current?: string, generatedFrom?: string): boolean {
  return !!current && !!generatedFrom && current !== generatedFrom;
}

/** Pure: derive each manifest component's status from git facts. Committed if
 *  its dir exists on master; else pending if an open codegen/<slug> PR exists;
 *  else never. A committed component is additionally flagged stale when its
 *  manifest figmaUpdatedAt differs from its contract's generated-from stamp. */
export function deriveComponentState(
  manifest: Manifest,
  committedComponents: string[],
  committedIcons: string[],
  prsByBranch: Map<string, string>,
  deletePrs: Map<string, string> = new Map(),
  contractVersions: Map<string, string | undefined> = new Map(),
): ComponentState[] {
  const all = [...(manifest.components ?? []), ...(manifest.icons ?? [])];
  return all.map((e) => {
    const deletePrUrl = deletePrs.get(e.slug);
    const committed = (e.isIcon ? committedIcons : committedComponents).includes(e.slug);
    if (committed) {
      const stale = !e.isIcon && isFigmaStale(e.figmaUpdatedAt, contractVersions.get(e.slug));
      return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "committed", deletePrUrl, stale };
    }
    const prUrl = prsByBranch.get(`codegen/${e.slug}`);
    if (prUrl) return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "pending", prUrl, deletePrUrl, stale: false };
    return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "never", deletePrUrl, stale: false };
  });
}

/** Load component state live from GitHub: manifest (master) + committed dirs
 *  derived from the recursive git tree (a dir counts as committed only if it
 *  holds real code, not just a sync-seeded contract.json) + open codegen PRs. */
export async function loadComponentState(): Promise<ComponentState[]> {
  const raw = await getFileContent("design-system.manifest.json");
  if (!raw) throw new Error("design-system.manifest.json not found on master");
  const manifest = JSON.parse(raw) as Manifest;
  const [tree, prs, deletePrs] = await Promise.all([listTree("master"), listOpenCodegenPRs(), listOpenDeletePRs()]);
  if (tree.truncated) throw new Error("git tree truncated -- cannot reliably derive committed state");
  const components = committedSlugsFromTree(tree.paths, "packages/components/src/components");
  const icons = committedSlugsFromTree(tree.paths, "packages/components/src/icons");

  // Change-detection: read each committed COMPONENT's contract for its
  // generated-from figmaUpdatedAt (icons excluded -- they self-heal on sync).
  const versionPairs = await Promise.all(
    components.map(async (slug): Promise<[string, string | undefined]> => {
      const c = await getFileContent(`packages/components/src/components/${slug}/${slug}.contract.json`).catch(() => null);
      if (!c) return [slug, undefined];
      try { return [slug, (JSON.parse(c) as { figmaUpdatedAt?: string }).figmaUpdatedAt]; }
      catch { return [slug, undefined]; }
    }),
  );
  const contractVersions = new Map(versionPairs);

  return deriveComponentState(manifest, components, icons, prs, deletePrs, contractVersions);
}
