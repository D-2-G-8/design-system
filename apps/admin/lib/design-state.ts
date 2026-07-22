import { getFileContent, listDirEntries, listOpenCodegenPRs } from "./github";

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

/** Load component state live from GitHub (manifest + committed dirs + open PRs). */
export async function loadComponentState(): Promise<ComponentState[]> {
  const raw = await getFileContent("design-system.manifest.json");
  if (!raw) throw new Error("design-system.manifest.json not found on master");
  const manifest = JSON.parse(raw) as Manifest;
  const [components, icons, prs] = await Promise.all([
    listDirEntries("packages/components/src/components"),
    listDirEntries("packages/components/src/icons"),
    listOpenCodegenPRs(),
  ]);
  return deriveComponentState(manifest, components, icons, prs);
}
