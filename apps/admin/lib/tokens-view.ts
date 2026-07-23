export interface TokenEntry { category: string; value: string }
export interface TokenGroup { category: string; tokens: { name: string; value: string }[] }

/** Group a flat token map by category, categories sorted alphabetically and
 *  tokens within each category sorted by name. Pure display helper for the
 *  dashboard Tokens section. */
export function groupTokensByCategory(tokens: Record<string, TokenEntry>): TokenGroup[] {
  const byCat = new Map<string, { name: string; value: string }[]>();
  for (const [name, t] of Object.entries(tokens)) {
    const arr = byCat.get(t.category) ?? [];
    arr.push({ name, value: t.value });
    byCat.set(t.category, arr);
  }
  return [...byCat.entries()]
    .map(([category, toks]) => ({
      category,
      tokens: toks.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}
