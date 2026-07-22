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

This app's human gate is **Vercel deployment protection**, not an in-app login
(a bespoke GitHub-OAuth login is Phase 4b). The Server Actions
(`generateComponent`, `getJobStatus`) are POST endpoints that dispatch **paid**
LLM/Figma/CI work; they cannot authenticate the caller in-code (the browser holds
no token), so they rely entirely on deployment protection.

**Deploy checklist:**

1. **Enable Vercel deployment protection across ALL environments — production
   AND preview.** Preview deployments serve the exact same Server Actions; an
   unprotected preview URL is a public paid-workflow dispatcher.
2. Do **not** enable "Protection Bypass for Automation" unless you fully
   understand it exposes those actions.
3. Set `ADMIN_TOKEN` (`openssl rand -base64 32`). It gates the bearer-protected
   `/api/*` routes and is also the fail-closed config signal for the Server
   Actions — **without it the dashboard's privileged actions refuse to run**
   (defense-in-depth: a bare/misconfigured deploy fails closed rather than
   dispatching work).
4. Set `GITHUB_TOKEN` (repo contents read + pull-requests read + workflow
   dispatch) and `GITHUB_DESIGN_SYSTEM_REPO=D-2-G-8/design-system`.
5. Attach a Vercel Postgres (auto-injects `POSTGRES_URL`; or set `JOB_DB_URL`).
6. Optional: `DESIGN_SYSTEM_STORYBOOK_URL` (the master Storybook stand) for the
   per-component Storybook links.

## Scripts

```
pnpm --filter @d-2-g-8/design-system-admin dev         # local dev
pnpm --filter @d-2-g-8/design-system-admin build       # next build (green with no env)
pnpm --filter @d-2-g-8/design-system-admin typecheck   # tsc --noEmit
pnpm --filter @d-2-g-8/design-system-admin test        # node:test fixtures via tsx
```
