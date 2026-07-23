import { getFileContent, listTree, listOpenCodegenPRs } from "./github";
import { committedSlugsFromTree } from "./committed";

export interface ComponentState {
  slug: string;
  name: string;
  isIcon: boolean;
  status: "committed" | "pending" | "never";
  prUrl?: string;
}

interface ManifestEntry { slug: string; name: string; isIcon: boolean }
interface Manifest { components: ManifestEntry[]; icons: ManifestEntry[] }

/** Pure: derive each manifest component's status from git facts. Committed if
 *  its dir exists on master; else pending if an open codegen/<slug> PR exists;
 *  else never. */
export function deriveComponentState(
  manifest: Manifest,
  committedComponents: string[],
  committedIcons: string[],
  prsByBranch: Map<string, string>,
): ComponentState[] {
  const all = [...(manifest.components ?? []), ...(manifest.icons ?? [])];
  return all.map((e) => {
    const committed = (e.isIcon ? committedIcons : committedComponents).includes(e.slug);
    if (committed) return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "committed" };
    const prUrl = prsByBranch.get(`codegen/${e.slug}`);
    if (prUrl) return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "pending", prUrl };
    return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "never" };
  });
}

/** Load component state live from GitHub: manifest (master) + committed dirs
 *  derived from the recursive git tree (a dir counts as committed only if it
 *  holds real code, not just a sync-seeded contract.json) + open codegen PRs. */
export async function loadComponentState(): Promise<ComponentState[]> {
  const raw = await getFileContent("design-system.manifest.json");
  if (!raw) throw new Error("design-system.manifest.json not found on master");
  const manifest = JSON.parse(raw) as Manifest;
  const [tree, prs] = await Promise.all([listTree("master"), listOpenCodegenPRs()]);
  if (tree.truncated) throw new Error("git tree truncated -- cannot reliably derive committed state");
  const components = committedSlugsFromTree(tree.paths, "packages/components/src/components");
  const icons = committedSlugsFromTree(tree.paths, "packages/components/src/icons");
  return deriveComponentState(manifest, components, icons, prs);
}
