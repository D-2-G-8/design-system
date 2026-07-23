/** Compact token count: 999 -> "999", 12345 -> "12.3k". */
export function formatTokens(n: number): string {
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1)}k`;
}
