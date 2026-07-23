import { rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { findRepoRoot, loadManifest, writeManifest, MANIFEST_FILE } from "./loaders";
import { componentSourcePaths } from "./paths";

/**
 * Fully remove a component from the repo: its manifest entry, its source dir,
 * and any root-barrel export line referencing it. Returns the changed paths.
 * Throws if the slug is not in the manifest. Generate registers each component
 * in the root barrel (writeComponent -> ensureBarrelExport), so this removes the
 * matching lines; it is also defensive -- a no-op for a never-generated (seed-
 * only) component that has no barrel line.
 */
export function deleteComponent(slug: string, root: string = findRepoRoot()): string[] {
  const manifest = loadManifest(root);
  const entry =
    manifest.components.find((e) => e.slug === slug) ?? manifest.icons.find((e) => e.slug === slug);
  if (!entry) throw new Error(`delete: "${slug}" is not in ${MANIFEST_FILE}`);

  const changed: string[] = [];

  manifest.components = manifest.components.filter((e) => e.slug !== slug);
  manifest.icons = manifest.icons.filter((e) => e.slug !== slug);
  writeManifest(manifest, root);
  changed.push(join(root, MANIFEST_FILE));

  const relDir = componentSourcePaths(slug, entry.isIcon).dir; // "src/components/<slug>"
  const absDir = join(root, "packages", "components", relDir);
  if (existsSync(absDir)) {
    rmSync(absDir, { recursive: true, force: true });
    changed.push(absDir);
  }

  const barrelPath = join(root, "packages", "components", "src", "index.ts");
  if (existsSync(barrelPath)) {
    const marker = `./${entry.isIcon ? "icons" : "components"}/${slug}"`;
    const lines = readFileSync(barrelPath, "utf8").split("\n");
    const kept = lines.filter((line) => !line.includes(marker));
    if (kept.length !== lines.length) {
      writeFileSync(barrelPath, kept.join("\n"));
      changed.push(barrelPath);
    }
  }
  return changed;
}
