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

As of **Phase 4b-ii**, an authenticated reviewer can also **merge** a
component's PR from `/review/<slug>` — the one high-stakes *write* the admin
performs. The merge is gated on the PR being **mergeable (no conflicts) AND
CI-green**; that gate is re-checked **server-side** immediately before the
merge (the server action never trusts the disabled/enabled state of the
button), behind an in-UI **confirm step**, and always uses **squash** merge
with a head-SHA concurrency guard (GitHub rejects the merge if the branch
moved since the check). The `/review/[slug]` page itself gained an explicit
in-code `auth()` gate at the top (redirects to `/signin`), on top of the
existing `middleware.ts` gate, so the page hosting the merge control is
session-checked in two independent places.

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
5. Set `GITHUB_TOKEN` and `GITHUB_DESIGN_SYSTEM_REPO=D-2-G-8/design-system`.
   As of **Phase 4b-ii**, the token needs **Pull requests: Write + Contents:
   Write** (to merge PRs from the UI) — one scope more than 4b-i's reads (repo
   contents read + pull-requests read + workflow dispatch, still required for
   the rest of the app). If the repo has a **branch-protection rule on
   `master`**, it must also allow this token to merge (e.g. exempt it, or
   ensure its required-checks match what CI reports) — otherwise the merge
   call gets a `405`/`409` from GitHub, surfaced in the UI as the blocked
   reason rather than a raw error.
6. Attach a Vercel Postgres (auto-injects `POSTGRES_URL`; or set `JOB_DB_URL`).
7. Optional: `DESIGN_SYSTEM_STORYBOOK_URL` (the master Storybook stand) for the
   per-component Storybook links.

### Review surface

`/review/<slug>` shows the worker's findings (read from the open
`codegen/<slug>` PR body) alongside the Figma design and the committed/rendered
screenshot, side by side. It requires a signed-in session — checked both by
`middleware.ts` and, as of 4b-ii, by an explicit `auth()` call at the top of
the page itself — and reads the **open** codegen PR for that slug — there's
nothing to show once the PR merges or if none exists yet.

When there's an open PR, the page also renders a **merge panel**: the PR's
mergeable/CI status, and a `Merge` button that's only enabled when GitHub
reports the PR mergeable with no conflicts and CI green. Clicking it asks for
confirmation, then calls the `mergeComponentPr` server action, which
re-derives mergeable/CI state itself right before merging (squash, with a
head-SHA guard) rather than trusting the client. A blocked merge shows the
specific reason (e.g. "CI not green", "has conflicts", "GitHub still
computing mergeability", or a GitHub-reported merge failure). There's no
batch-merge, auto-merge, merge queue, or in-UI choice of merge method — all
out of scope for now.

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
