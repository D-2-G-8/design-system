/** Parse ADMIN_GITHUB_USERS into a trimmed, lowercased non-empty list, or null
 *  (→ use org check). Lowercased because GitHub logins are case-insensitive, so
 *  the match below must be too (else `Alice` in the env denies user `alice`). */
export function parseAllowlist(env: string | undefined): string[] | null {
  if (!env) return null;
  const list = env.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return list.length ? list : null;
}
/** Pure authz decision: an explicit allowlist wins; otherwise org membership.
 *  The allowlist compare is case-insensitive (GitHub logins are). */
export function isAllowedGitHubUser(login: string, opts: { allowlist: string[] | null; isOrgMember: boolean }): boolean {
  if (opts.allowlist) return opts.allowlist.includes(login.toLowerCase());
  return opts.isOrgMember;
}
