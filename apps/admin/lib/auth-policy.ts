/** Parse ADMIN_GITHUB_USERS into a trimmed non-empty list, or null (→ use org check). */
export function parseAllowlist(env: string | undefined): string[] | null {
  if (!env) return null;
  const list = env.split(",").map((s) => s.trim()).filter(Boolean);
  return list.length ? list : null;
}
/** Pure authz decision: an explicit allowlist wins; otherwise org membership. */
export function isAllowedGitHubUser(login: string, opts: { allowlist: string[] | null; isOrgMember: boolean }): boolean {
  if (opts.allowlist) return opts.allowlist.includes(login);
  return opts.isOrgMember;
}
