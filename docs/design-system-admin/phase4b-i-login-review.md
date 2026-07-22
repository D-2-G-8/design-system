# Phase 4b-i — GitHub-OAuth login + read-only review surface

Add the admin's real **login** (GitHub OAuth, org-membership gated) — the in-app
gate the 4a server actions currently lack — and a **read-only review surface**
for a pending component: the worker's findings (from the PR body) next to the
**Figma design vs the rendered screenshot** side-by-side. Merge-from-UI is
Phase 4b-ii (behind this login).

Builds on Phase 4a (the dashboard + server actions + `lib/github` read helpers +
`lib/design-state`). Source-of-truth docs: `architecture.md`, `phase4a-admin-ui.md`.

## Locked decisions (settled with the user)

1. **Login = GitHub OAuth**, authorized by **`D-2-G-8` org membership** (natural
   for a tool whose privileged actions are dispatch-workflow + merge-PR), with an
   env **username allowlist override** (`ADMIN_GITHUB_USERS`) as a simpler path.
2. **Scope:** 4b-i = login + **read-only** review surface. Merge-from-UI = 4b-ii.
3. **Review surface includes the Figma design ↔ rendered-screenshot side-by-side**
   (the admin fetches the Figma render server-side with its own
   `FIGMA_ACCESS_TOKEN` — the worker keeps its own secret regardless).
4. The login becomes the in-app **"suspenders"**: the 4a `ADMIN_TOKEN` fail-closed
   guard on the server actions is **replaced by a real session check**. `/api/*`
   bearer routes stay for programmatic callers.

## Architecture

```
Browser → NextAuth (GitHub OAuth) → session (org-gated on sign-in)
   │  middleware gates the whole app (redirect to /signin), except /api/* (bearer) + auth routes
   ▼  apps/admin
   • Server Components / Actions require a session (auth()); ADMIN_TOKEN guard → session check
   • Review page /review/[slug]: PR body findings + [Figma design | rendered baseline] + PR link
   • /api/* bearer routes unchanged (programmatic)
```

## Part A — Auth (NextAuth v5 / Auth.js)

New dependency **`next-auth@beta`** (v5). Files:
- **`apps/admin/auth.ts`** — `export const { handlers, auth, signIn, signOut } = NextAuth({...})`:
  GitHub provider (scope `read:org read:user user:email`); a `signIn` callback that
  returns `isAllowedGitHubUser(login, { allowlist, isOrgMember })` — **pure**
  decision extracted so it's unit-tested.
- **`apps/admin/app/api/auth/[...nextauth]/route.ts`** — `export const { GET, POST } = handlers`.
- **`apps/admin/middleware.ts`** — `export { auth as middleware }` with a `matcher`
  that protects app routes but EXCLUDES `/api/*` (bearer-gated), `/signin`,
  `/api/auth/*`, and static assets.
- **`apps/admin/app/signin/page.tsx`** — a minimal "Sign in with GitHub" page
  (calls the `signIn("github")` server action).
- **`apps/admin/lib/auth-policy.ts`** (NEW, pure): `isAllowedGitHubUser(login, {
  allowlist: string[] | null, isOrgMember: boolean }): boolean` — if `allowlist`
  is non-empty, membership = login ∈ allowlist; else membership = `isOrgMember`.
  Plus `parseAllowlist(env): string[] | null`. The org check itself
  (`GET /orgs/<org>/members/<login>` with the user's token → 204/404) lives in the
  `signIn` callback (impure), feeding `isOrgMember` into the pure decision.

Env: `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_ORG`
(default the org from `GITHUB_DESIGN_SYSTEM_REPO`), optional `ADMIN_GITHUB_USERS`.

**Compatibility risk (verify in task 1, before building the rest):** the admin runs
**Next.js 16 / React 19**, which is newer than what `next-auth@beta` (v5) is
primarily tested against. Task 1 must confirm `next-auth@beta` installs and
`next build` succeeds on Next 16. **If it's incompatible**, fall back to a
**minimal hand-rolled GitHub OAuth flow** (an `/api/auth/login` redirect to
GitHub → `/api/auth/callback` that exchanges the code, checks org membership, and
sets a signed, httpOnly session cookie; middleware verifies the cookie). The
`isAllowedGitHubUser` policy + middleware-gating + the session-check design are
identical either way — only the session-plumbing differs. Escalate the choice if
the fallback is needed.

## Part B — Server actions gated by the session

- **`app/actions.ts`**: replace `assertConfigured()` (the 4a `ADMIN_TOKEN` guard)
  with `const session = await auth(); if (!session?.user) throw new Error("Unauthorized")`.
  Both `generateComponent` and `getJobStatus` require a session. (Middleware already
  redirects unauthenticated humans; this is the in-code defense-in-depth the 4a
  review asked for.)
- A small **header** on the dashboard showing the signed-in GitHub login + a
  **Sign out** control (`signOut` server action).

## Part C — Review surface (`/review/[slug]`)

- **`lib/github.ts`** gains:
  - `getPullRequestForSlug(slug): Promise<{ number: number; body: string; htmlUrl: string; headRef: string } | null>` —
    the open `codegen/<slug>` PR (via the pulls list / `?head=<org>:codegen/<slug>`), or null.
  - `getFileBase64(path, ref): Promise<string | null>` — the contents API's raw
    base64 (NOT utf8-decoded — for binary PNGs), null on 404.
- **`lib/figma.ts`** (NEW, minimal): `getFileImages(fileKey, nodeIds, token, opts)`
  (X-Figma-Token PAT) + `fetchNodeImageDataUrl(fileKey, nodeId, token): Promise<string | null>`
  (render → download → `data:image/png;base64,...`). Uses the admin's
  `FIGMA_ACCESS_TOKEN`. (Mirrors codegen's figma/figma-image, kept local to avoid
  a build-order coupling to `@d-2-g-8/codegen`.)
- **`app/review/[slug]/page.tsx`** (server component): load `getPullRequestForSlug(slug)`;
  if none → "No open PR for this component." Else render:
  - the **PR body** (findings) as text + an **Open PR** link (`htmlUrl`),
  - **side-by-side**: the **Figma design** (`fetchNodeImageDataUrl(manifest.figmaFileKey,
    figmaNodeIds[0], FIGMA_ACCESS_TOKEN)`, if configured + a nodeId) and the
    **rendered baseline** (`getFileBase64("tests/visual/__screenshots__/linux/<slug>.png",
    headRef)` → inline `data:` image), each with a "not available" fallback.
  - Built with the **frontend-design** skill (calm two-up compare, findings list).
- The dashboard's **pending** rows link to `/review/<slug>` (in addition to the raw PR link).

## Testing

- **`isAllowedGitHubUser` / `parseAllowlist`** (pure): fixtures — allowlist hit/miss,
  org-member true/false when no allowlist, empty allowlist falls through to org.
- **`getPullRequestForSlug` shaping** + **`getFileBase64`** (base64 passthrough, 404→null)
  with injected `githubFetch`.
- **`next build`** with a placeholder `AUTH_SECRET` (NextAuth requires a secret to
  initialize; the 4a "green with zero env" invariant relaxes to "green with a
  throwaway `AUTH_SECRET`" — document it). `tsc --noEmit` clean.
- Admin fixtures (design-state, run-correlation, auth-policy) pass.

## Ops / preconditions (user)

- Create a **GitHub OAuth app** (callback `https://<admin>/api/auth/callback/github`);
  set `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`/`AUTH_SECRET` (`openssl rand -base64 32`),
  `ADMIN_ORG=D-2-G-8` (or rely on the repo's org), optional `ADMIN_GITHUB_USERS`.
- Set `FIGMA_ACCESS_TOKEN` on the admin (for the design render).
- **Vercel deployment protection can now relax to defense-in-depth** (the login is
  the primary human gate) — but keep it on. The build needs `AUTH_SECRET` set (even
  a throwaway) — set it in the Vercel/CI build env.

## Out of scope (4b-ii / later)

- **Merge-from-UI** (approve/merge the PR) — 4b-ii, behind this login.
- Deep per-story **Storybook embed** (codegen story-id coupling — still deferred).
- Rich markdown rendering of the PR body; per-state review; multi-org support.

## Ordered outline (for the plan)

1. NextAuth setup: `auth.ts` (GitHub provider + org/allowlist `signIn` via
   `isAllowedGitHubUser`) + `api/auth/[...nextauth]` + `middleware.ts` + `signin`
   page + `lib/auth-policy.ts` + fixtures. Add `next-auth@beta`.
2. Server actions → session check (replace `assertConfigured`) + a header with the
   signed-in user + sign-out.
3. `github.ts` `getPullRequestForSlug` + `getFileBase64`; `lib/figma.ts` +
   `fetchNodeImageDataUrl`; fixtures.
4. `/review/[slug]` page (findings + Figma↔screenshot side-by-side + PR link) +
   dashboard pending-row links. frontend-design.
5. Verify (tsc + admin build with placeholder AUTH_SECRET + fixtures) + docs/ops.
