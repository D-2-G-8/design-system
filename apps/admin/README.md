# Design System Admin

A Vercel Next.js dashboard to trigger and monitor design-system component
generation. The generation itself runs as a GitHub Actions workflow
(`.github/workflows/generate.yml`), **not** in this app — the admin only reads
state and dispatches work.

- **Component status** is derived from git via the GitHub API (committed on
  master / pending open `codegen/<slug>` PR / never).
- **Privileged work** (dispatch a generation, read job data) runs **server-side**
  — via Server Components and Server Actions. The browser never holds a token.

## ⚠️ Security — read before deploying

As of **Phase 4b-i**, **GitHub-OAuth login (NextAuth) is the primary human
gate**: the whole app is session-gated by `middleware.ts` (redirects
unauthenticated humans to `/signin`), and the Server Actions
(`generateComponent`, `getJobStatus`) re-check the session themselves
(defense-in-depth — they're POST endpoints reachable directly, not only via a
middleware-matched page). Login is authorized by `D-2-G-8` org membership, with
an optional username-allowlist override.

Previously (Phase 4a) this app's *only* human gate was **Vercel deployment
protection**, with `ADMIN_TOKEN` as the fail-closed config signal for the
Server Actions. That invariant is now **relaxed**: deployment protection
remains recommended as defense-in-depth (**keep it on**), but it is no longer
the sole gate. `ADMIN_TOKEN` still gates the bearer-protected `/api/*` routes
for programmatic callers — set it if you use those.

### Auth setup (GitHub OAuth)

1. Create a **GitHub OAuth app** (org or personal) with callback URL
   `https://<admin-deployment>/api/auth/callback/github`.
2. Set env vars:
   - `AUTH_SECRET` — `openssl rand -base64 32`. **Required for the app to run
     AND to build** (NextAuth needs a secret to initialize — even a throwaway
     value is enough at build time; see Scripts below).
   - `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — from the OAuth app in step 1.
   - `ADMIN_ORG` — the GitHub org whose members are allowed to sign in
     (defaults to the org half of `GITHUB_DESIGN_SYSTEM_REPO`, e.g. `D-2-G-8`).
   - Optional `ADMIN_GITHUB_USERS` — comma-separated GitHub logins; if set,
     this allowlist is used **instead of** the org-membership check (a
     simpler path for small deployments).
3. Set `FIGMA_ACCESS_TOKEN` — the admin's own Figma PAT, used by the
   `/review/[slug]` page to render the Figma design for the design-vs-screenshot
   comparison (independent of the worker's own Figma token).

**Deploy checklist:**

1. Complete the auth setup above — without `AUTH_GITHUB_ID`/`AUTH_GITHUB_SECRET`/
   `AUTH_SECRET` no one can sign in and the app is unreachable (fail-closed).
2. **Keep Vercel deployment protection on across ALL environments — production
   AND preview** — as defense-in-depth alongside the login, not a replacement
   for it.
3. Do **not** enable "Protection Bypass for Automation" unless you fully
   understand it exposes the app ahead of the login.
4. Set `ADMIN_TOKEN` (`openssl rand -base64 32`) if you use the bearer-protected
   `/api/*` routes for programmatic callers.
5. Set `GITHUB_TOKEN` (repo contents read + pull-requests read + workflow
   dispatch) and `GITHUB_DESIGN_SYSTEM_REPO=D-2-G-8/design-system`.
6. Attach a Vercel Postgres (auto-injects `POSTGRES_URL`; or set `JOB_DB_URL`).
7. Optional: `DESIGN_SYSTEM_STORYBOOK_URL` (the master Storybook stand) for the
   per-component Storybook links.

### Review surface

`/review/<slug>` shows the worker's findings (read from the open
`codegen/<slug>` PR body) alongside the Figma design and the committed/rendered
screenshot, side by side. It requires a signed-in session (same gate as the
rest of the app) and reads the **open** codegen PR for that slug — there's
nothing to show once the PR merges or if none exists yet.

## Scripts

```
pnpm --filter @d-2-g-8/design-system-admin dev         # local dev
AUTH_SECRET=... pnpm --filter @d-2-g-8/design-system-admin build   # next build — needs AUTH_SECRET
pnpm --filter @d-2-g-8/design-system-admin typecheck   # tsc --noEmit
pnpm --filter @d-2-g-8/design-system-admin test        # node:test fixtures via tsx
```

Since Phase 4b-i, `next build` requires `AUTH_SECRET` to be set (NextAuth
initializes at build time and needs a secret) — even a throwaway value works,
e.g. `AUTH_SECRET=test-only`. This relaxes the prior "green build with zero
env" invariant from 4a.
