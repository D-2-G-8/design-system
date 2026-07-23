/**
 * Given every blob path in the repo tree and a base dir like
 * "packages/components/src/components", return the slugs (immediate subdir
 * names) whose directory holds real generated code -- a `*.tsx` file or an
 * `index.ts` -- as opposed to a directory that holds only a
 * `<slug>.contract.json` seed written by the metadata sync. This is what makes
 * a component read as "committed" on the dashboard.
 */
export function committedSlugsFromTree(blobPaths: string[], baseDir: string): string[] {
  const prefix = baseDir.endsWith("/") ? baseDir : baseDir + "/";
  const slugs = new Set<string>();
  for (const p of blobPaths) {
    if (!p.startsWith(prefix)) continue;
    const rest = p.slice(prefix.length); // "<slug>/<...>/<file>"
    const firstSlash = rest.indexOf("/");
    if (firstSlash < 0) continue; // a file directly in baseDir, not inside a slug dir
    const slug = rest.slice(0, firstSlash);
    const file = rest.slice(rest.lastIndexOf("/") + 1);
    if (file === "index.ts" || file.endsWith(".tsx")) slugs.add(slug);
  }
  return [...slugs];
}
