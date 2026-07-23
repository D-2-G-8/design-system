export interface ManifestEntry { slug: string; name: string; isIcon: boolean }
export interface Manifest { figmaFileKey?: string; components?: ManifestEntry[]; icons?: ManifestEntry[] }
export interface TokenEntry { category: string; value: string }

export interface EntryDiff {
  added: ManifestEntry[];
  removed: ManifestEntry[];
  renamed: { slug: string; from: string; to: string }[];
}

/** Diff two entry lists by slug: added (in head only), removed (in base only),
 *  renamed (same slug, different name). */
export function diffEntries(base: ManifestEntry[], head: ManifestEntry[]): EntryDiff {
  const baseBySlug = new Map(base.map((e) => [e.slug, e]));
  const headBySlug = new Map(head.map((e) => [e.slug, e]));
  const added = head.filter((e) => !baseBySlug.has(e.slug));
  const removed = base.filter((e) => !headBySlug.has(e.slug));
  const renamed: { slug: string; from: string; to: string }[] = [];
  for (const e of head) {
    const b = baseBySlug.get(e.slug);
    if (b && b.name !== e.name) renamed.push({ slug: e.slug, from: b.name, to: e.name });
  }
  return { added, removed, renamed };
}

export function diffCatalog(base: Manifest, head: Manifest): { components: EntryDiff; icons: EntryDiff } {
  return {
    components: diffEntries(base.components ?? [], head.components ?? []),
    icons: diffEntries(base.icons ?? [], head.icons ?? []),
  };
}

export interface TokenDiff {
  added: string[];
  removed: string[];
  changed: { name: string; from: string; to: string }[];
}

/** Diff two token maps by key, comparing the `value` field. */
export function diffTokens(
  base: Record<string, TokenEntry>,
  head: Record<string, TokenEntry>,
): TokenDiff {
  const added = Object.keys(head).filter((k) => !(k in base));
  const removed = Object.keys(base).filter((k) => !(k in head));
  const changed = Object.keys(head)
    .filter((k) => k in base && base[k].value !== head[k].value)
    .map((k) => ({ name: k, from: base[k].value, to: head[k].value }));
  return { added, removed, changed };
}
