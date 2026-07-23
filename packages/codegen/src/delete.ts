import { rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { findRepoRoot, loadManifest, writeManifest, MANIFEST_FILE } from "./loaders";
import { componentSourcePaths } from "./paths";

/**
 * Fully remove a component from the repo: its manifest entry, its source dir,
 * and any root-barrel export line referencing it. Returns the changed paths.
 * Throws if the slug is not in the manifest. Barrel removal is defensive -- a
 * no-op when the component was never barrelled (generate does not add barrel
 * lines today), but it prevents a broken build for one that was (e.g. Button).
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
