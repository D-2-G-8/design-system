# Phase 4b-i — Login + Read-only Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the admin a real **GitHub-OAuth login** (org-membership gated — the in-app gate the 4a server actions lack) and a **read-only review surface** for a pending component: the worker's findings next to the **Figma design vs the rendered screenshot**.

**Architecture:** NextAuth (Auth.js v5) with the GitHub provider gates the whole app via middleware and a `signIn` org-membership check; the server actions move from the 4a `ADMIN_TOKEN` guard to a real session check. A `/review/[slug]` server page reads the open `codegen/<slug>` PR (findings from its body), the committed baseline PNG (GitHub API on the PR branch), and the Figma render (admin `FIGMA_ACCESS_TOKEN`) — shown side-by-side. Merge-from-UI is Phase 4b-ii.

**Tech Stack:** Next.js 16 (App Router, RSC + Server Actions), React 19, `next-auth@beta` (v5), TypeScript 5.9, CSS Modules, `tsx`/`node:test`, the existing `lib/{github,jobs,design-state,auth}`.

## Global Constraints

- **Spec:** `design-system/docs/design-system-admin/phase4b-i-login-review.md` — source of truth.
- **Branch:** `phase4b-i-login-review`, off `master` (pull first — 4a is merged). NEVER commit to master; NEVER `git add -A`.
- **Locked decisions:** login = GitHub OAuth, authorize by `D-2-G-8` org membership with an `ADMIN_GITHUB_USERS` allowlist override; 4b-i = login + **read-only** review (merge = 4b-ii); the review includes the **Figma design ↔ rendered-screenshot side-by-side** (admin fetches the Figma render server-side); the login replaces the 4a `ADMIN_TOKEN` server-action guard with a session check; `/api/*` bearer routes unchanged.
- **Build invariant (RELAXED):** NextAuth needs `AUTH_SECRET` to initialize, so the admin `next build` now needs a **throwaway `AUTH_SECRET`** (not "zero env" anymore). Verify build green with `AUTH_SECRET=test-only`.
- **Compatibility gate (Task 1):** the admin is **Next.js 16 / React 19** — newer than `next-auth@beta`'s tested matrix. Task 1 **verifies install + build FIRST**; if `next-auth@beta` doesn't build on Next 16, STOP and report BLOCKED for the hand-rolled-OAuth fallback (the policy/middleware/session-check design is identical; only the session plumbing differs).
- **Discipline:** everything GENERAL (rows/entries from the manifest + git, no hardcoded component names). English only. `corepack pnpm`. `cd` the repo dir each shell call. The review UI (task 4) uses the **frontend-design** skill.
- **Out of scope (4b-ii):** merge-from-UI, deep per-story Storybook embed, rich markdown of the PR body.

## File Structure

```
apps/admin/
  auth.ts                          NEW — NextAuth config (GitHub + org/allowlist signIn)
  middleware.ts                    NEW — gate the app (exclude /api, /signin, static)
  lib/auth-policy.ts               NEW — pure isAllowedGitHubUser + parseAllowlist
  lib/figma.ts                     NEW — getFileImages + fetchNodeImageDataUrl (admin-side render)
  lib/github.ts                    MODIFY — getPullRequestForSlug + getFileBase64
  app/api/auth/[...nextauth]/route.ts   NEW — export { GET, POST } = handlers
  app/signin/page.tsx              NEW — "Sign in with GitHub"
  app/actions.ts                   MODIFY — session check replaces assertConfigured; signOut
  app/components/Header.tsx        NEW — signed-in user + sign out (client/server)
  app/page.tsx                     MODIFY — render Header
  app/components/ComponentTable.tsx     MODIFY — a Review link on pending rows
  app/review/[slug]/page.tsx       NEW — findings + Figma↔screenshot side-by-side
  app/review/review.module.css     NEW
  test/auth-policy.test.ts         NEW
  test/github-review.test.ts       NEW (getPullRequestForSlug shaping + getFileBase64)
  package.json                     MODIFY — add next-auth@beta
```

---

## Task 1: NextAuth setup + org/allowlist policy (with a compat gate)

**Files:** branch + spec commit; `package.json`, `auth.ts`, `app/api/auth/[...nextauth]/route.ts`, `middleware.ts`, `app/signin/page.tsx`, `lib/auth-policy.ts`, `test/auth-policy.test.ts`.

**Interfaces:** Produces `auth`/`handlers`/`signIn`/`signOut` (`@/auth`); `isAllowedGitHubUser(login, {allowlist, isOrgMember})`, `parseAllowlist(env)` (`@/lib/auth-policy`).

- [ ] **Step 1: Branch, spec commit, and the COMPAT GATE**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git checkout master && git pull --ff-only
git checkout -b phase4b-i-login-review
git add docs/design-system-admin/phase4b-i-login-review.md
git commit -m "docs(phase4b-i): login + read-only review spec

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
corepack pnpm --filter @d-2-g-8/design-system-admin add next-auth@beta
```
Then write a MINIMAL `auth.ts` (below) + the route + middleware, and run the compat smoke:
```bash
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsc --noEmit
AUTH_SECRET=test-only corepack pnpm -F @d-2-g-8/design-system-admin build
```
**If install or build FAILS on Next 16 → STOP, report BLOCKED** with the error (do not force it). The controller re-plans with the hand-rolled-OAuth fallback. Verify the lockfile stays v9 after the add.

- [ ] **Step 2: `lib/auth-policy.ts` (pure) + failing test**

`test/auth-policy.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedGitHubUser, parseAllowlist } from "../lib/auth-policy";

test("parseAllowlist: null when unset/empty, trimmed list otherwise", () => {
  assert.equal(parseAllowlist(undefined), null);
  assert.equal(parseAllowlist("  "), null);
  assert.deepEqual(parseAllowlist("alice, bob"), ["alice", "bob"]);
});
test("allowlist present: membership = login in allowlist (org ignored)", () => {
  assert.equal(isAllowedGitHubUser("alice", { allowlist: ["alice"], isOrgMember: false }), true);
  assert.equal(isAllowedGitHubUser("mallory", { allowlist: ["alice"], isOrgMember: true }), false);
});
test("no allowlist: falls through to org membership", () => {
  assert.equal(isAllowedGitHubUser("alice", { allowlist: null, isOrgMember: true }), true);
  assert.equal(isAllowedGitHubUser("alice", { allowlist: null, isOrgMember: false }), false);
});
```
`lib/auth-policy.ts`:
```ts
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
```
Run RED → GREEN: `corepack pnpm --filter @d-2-g-8/design-system-admin exec tsx --test test/auth-policy.test.ts`.

- [ ] **Step 3: `auth.ts` (GitHub + org check via the pure policy)**

```ts
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { isAllowedGitHubUser, parseAllowlist } from "@/lib/auth-policy";

const ORG = process.env.ADMIN_ORG || (process.env.GITHUB_DESIGN_SYSTEM_REPO?.split("/")[0] ?? "");

async function isOrgMember(login: string, token: string): Promise<boolean> {
  if (!ORG) return false;
  const res = await fetch(`https://api.github.com/orgs/${ORG}/members/${login}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
  });
  return res.status === 204; // 204 = member, 404 = not
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: { signIn: "/signin" },
  providers: [GitHub({ authorization: { params: { scope: "read:org read:user user:email" } } })],
  callbacks: {
    async signIn({ profile, account }) {
      const login = (profile as { login?: string } | null)?.login;
      const token = account?.access_token;
      if (!login || !token) return false;
      const allowlist = parseAllowlist(process.env.ADMIN_GITHUB_USERS);
      const member = allowlist ? false : await isOrgMember(login, token);
      return isAllowedGitHubUser(login, { allowlist, isOrgMember: member });
    },
  },
});
```
`app/api/auth/[...nextauth]/route.ts`:
```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 4: `middleware.ts` + `app/signin/page.tsx`**

`middleware.ts`:
```ts
export { auth as middleware } from "@/auth";
// Gate app pages + server actions; EXCLUDE /api (bearer + NextAuth), static, /signin.
export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico|signin).*)"] };
```
`app/signin/page.tsx`:
```tsx
import { signIn } from "@/auth";

export default function SignIn() {
  return (
    <main style={{ padding: "4rem", maxWidth: 420, margin: "0 auto", fontFamily: "system-ui" }}>
      <h1>Design System Admin</h1>
      <p>Sign in with GitHub. Access is limited to the design-system org.</p>
      <form action={async () => { "use server"; await signIn("github", { redirectTo: "/" }); }}>
        <button type="submit">Sign in with GitHub</button>
      </form>
    </main>
  );
}
```

- [ ] **Step 5: Verify + commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsc --noEmit
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsx --test test/auth-policy.test.ts
AUTH_SECRET=test-only corepack pnpm -F @d-2-g-8/design-system-admin build
grep -m1 lockfileVersion pnpm-lock.yaml
```
Expected: tsc clean; auth-policy fixtures pass; build green with `AUTH_SECRET`; lockfile v9. Commit `auth.ts`, `middleware.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/signin/page.tsx`, `lib/auth-policy.ts`, `test/auth-policy.test.ts`, `package.json`, `pnpm-lock.yaml` with:
`feat(admin): GitHub-OAuth login (NextAuth) gated by org membership + allowlist`.

---

## Task 2: Server actions gated by the session + header/sign-out

**Files:** MODIFY `app/actions.ts`; NEW `app/components/Header.tsx`; MODIFY `app/page.tsx`.

- [ ] **Step 1: Replace the `ADMIN_TOKEN` guard with a session check in `app/actions.ts`**

Remove `assertConfigured` and its calls; add:
```ts
import { auth } from "@/auth";

async function requireSession(): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized -- sign in to use the admin.");
}
```
Call `await requireSession();` first in BOTH `generateComponent` and `getJobStatus`. (Middleware already redirects unauthenticated humans; this is the in-code defense-in-depth replacing the 4a `ADMIN_TOKEN` open/closed concern.)

- [ ] **Step 2: `Header.tsx` (signed-in user + sign out) + render it in `page.tsx`**

`Header.tsx` (server component reading the session; a server-action sign-out form):
```tsx
import { auth, signOut } from "@/auth";
import styles from "./dashboard.module.css";

export async function Header() {
  const session = await auth();
  const login = (session?.user?.name ?? session?.user?.email) as string | undefined;
  return (
    <header className={styles.appHeader}>
      <span className={styles.appTitle}>Design System Admin</span>
      {login && (
        <span className={styles.appUser}>
          {login}
          <form action={async () => { "use server"; await signOut({ redirectTo: "/signin" }); }}>
            <button type="submit" className={styles.signOut}>Sign out</button>
          </form>
        </span>
      )}
    </header>
  );
}
```
In `page.tsx`, render `<Header />` above the dashboard content. (frontend-design shapes the header/sign-out styling in `dashboard.module.css`.)

- [ ] **Step 3: Verify + commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsc --noEmit
corepack pnpm --filter @d-2-g-8/design-system-admin test
AUTH_SECRET=test-only corepack pnpm -F @d-2-g-8/design-system-admin build
```
Expected: tsc clean; admin fixtures pass; build green. Commit `app/actions.ts`, `app/components/Header.tsx`, `app/page.tsx`, `app/components/dashboard.module.css` with:
`feat(admin): gate server actions on the session; header + sign out`.

---

## Task 3: Review data helpers (`github.ts` + `lib/figma.ts`)

**Files:** MODIFY `lib/github.ts`; NEW `lib/figma.ts`; NEW `test/github-review.test.ts`.

**Interfaces:** `getPullRequestForSlug(slug)`, `getFileBase64(path, ref)` (`@/lib/github`); `getFileImages(...)`, `fetchNodeImageDataUrl(fileKey, nodeId, token, deps?)` (`@/lib/figma`).

- [ ] **Step 1: Add `getPullRequestForSlug` + `getFileBase64` to `lib/github.ts`**

```ts
/** The open codegen/<slug> PR, or null. */
export async function getPullRequestForSlug(
  slug: string,
): Promise<{ number: number; body: string; htmlUrl: string; headRef: string } | null> {
  const { repo } = getConfig();
  const org = repo.split("/")[0];
  const res = await githubFetch(`/repos/${repo}/pulls?state=open&head=${org}:codegen/${slug}`);
  if (!res.ok) throw new Error(`getPullRequestForSlug ${slug}: ${res.status} ${await res.text()}`);
  const prs = (await res.json()) as { number: number; body: string | null; html_url: string; head: { ref: string } }[];
  const pr = prs[0];
  return pr ? { number: pr.number, body: pr.body ?? "", htmlUrl: pr.html_url, headRef: pr.head.ref } : null;
}

/** Raw base64 file content at `ref` (NOT utf8-decoded -- for binary/PNG). Null on 404. */
export async function getFileBase64(path: string, ref: string): Promise<string | null> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/contents/${encodeURI(path)}?ref=${ref}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getFileBase64 ${path}: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { content?: string };
  return data.content ? data.content.replace(/\n/g, "") : null;
}
```

- [ ] **Step 2: `lib/figma.ts` (admin-side Figma render → data URL)**

```ts
type FetchLike = typeof fetch;

/** Render Figma nodes → nodeId→URL map (X-Figma-Token PAT or Bearer OAuth). */
export async function getFileImages(
  fileKey: string, nodeIds: string[], token: string,
  { format = "png", scale = 2 }: { format?: "png" | "svg" | "jpg"; scale?: number } = {},
  fetchImpl: FetchLike = fetch,
): Promise<Record<string, string | null>> {
  const ids = encodeURIComponent(nodeIds.join(","));
  const headers = token.startsWith("figd_")
    ? { "X-Figma-Token": token } : { Authorization: `Bearer ${token}` };
  const res = await fetchImpl(`https://api.figma.com/v1/images/${fileKey}?ids=${ids}&format=${format}&scale=${scale}`, {
    headers, signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`Figma images ${res.status}`);
  const data = (await res.json()) as { images?: Record<string, string | null>; err?: string | null };
  if (data.err) throw new Error(`Figma render: ${data.err}`);
  return data.images ?? {};
}

/** Render one node and inline it as a data URL, or null if it can't render.
 *  Best-effort (advisory review context -- never throws). Deps injectable. */
export async function fetchNodeImageDataUrl(
  fileKey: string, nodeId: string, token: string,
  deps: { getImages?: typeof getFileImages; fetchImpl?: FetchLike } = {},
): Promise<string | null> {
  const getImages = deps.getImages ?? getFileImages;
  const fetchImpl = deps.fetchImpl ?? fetch;
  try {
    const images = await getImages(fileKey, [nodeId], token, {}, fetchImpl);
    const url = images[nodeId];
    if (!url) return null;
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return null;
    return `data:image/png;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: `test/github-review.test.ts` (injected fetch)**

Fixtures with an injected `githubFetch`/`fetch` are awkward for the module-scoped `githubFetch`; instead unit-test the PURE-ish shaping you CAN isolate: `fetchNodeImageDataUrl` with injected `getImages`+`fetchImpl` (returns a `data:image/png;base64,...` on success; null when the map has no URL; null when the image download fails). For `getPullRequestForSlug`/`getFileBase64`, assert their behavior via a small injected-`fetch` wrapper if feasible, else cover them by the build + a documented live smoke. Write at least the `fetchNodeImageDataUrl` cases:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchNodeImageDataUrl } from "../lib/figma";

const PNG = new Uint8Array([137, 80, 78, 71]);
test("fetchNodeImageDataUrl → data URL on success", async () => {
  const r = await fetchNodeImageDataUrl("F", "1:2", "figd_x", {
    getImages: async () => ({ "1:2": "https://figma/img.png" }),
    fetchImpl: (async () => ({ ok: true, arrayBuffer: async () => PNG.buffer })) as unknown as typeof fetch,
  });
  assert.ok(r?.startsWith("data:image/png;base64,"));
});
test("null when Figma has no URL / download fails", async () => {
  assert.equal(await fetchNodeImageDataUrl("F", "1:2", "t", { getImages: async () => ({ "1:2": null }) }), null);
  assert.equal(await fetchNodeImageDataUrl("F", "1:2", "t", {
    getImages: async () => ({ "1:2": "u" }),
    fetchImpl: (async () => ({ ok: false })) as unknown as typeof fetch,
  }), null);
});
```

- [ ] **Step 4: Verify + commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsx --test test/github-review.test.ts
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsc --noEmit
```
Expected: fixtures pass; tsc clean. Commit `lib/github.ts`, `lib/figma.ts`, `test/github-review.test.ts` with:
`feat(admin): review data helpers — getPullRequestForSlug/getFileBase64 + Figma render`.

---

## Task 4: The review page + dashboard links

**Files:** NEW `app/review/[slug]/page.tsx`, `app/review/review.module.css`; MODIFY `app/components/ComponentTable.tsx`.

**REQUIRED SUB-SKILL:** invoke **frontend-design** for the review layout (a calm two-up compare + a findings list).

- [ ] **Step 1: `app/review/[slug]/page.tsx` (server component)**

Data flow (fixed contract; frontend-design shapes the look):
```tsx
export const dynamic = "force-dynamic";
// params: { slug } (Next 16 async params → await params)
// 1. const pr = await getPullRequestForSlug(slug).catch(() => null)
//    → if null: render "No open PR for <slug>."
// 2. const manifestRaw = await getFileContent("design-system.manifest.json"); parse → find the entry
//    → { isIcon, figmaNodeIds, name }, and figmaFileKey (env FIGMA_FILE_KEY ?? manifest.figmaFileKey)
// 3. const rendered = await getFileBase64(`tests/visual/__screenshots__/linux/${slug}.png`, pr.headRef)
//    → `data:image/png;base64,${rendered}` or a "no baseline yet" note
// 4. const token = process.env.FIGMA_ACCESS_TOKEN; const nodeId = figmaNodeIds[0]
//    const design = (token && fileKey && nodeId) ? await fetchNodeImageDataUrl(fileKey, nodeId, token) : null
// Render: <h1>Review: {name}</h1>, an "Open PR ↗" link (pr.htmlUrl),
//   a two-up compare [Figma design | Rendered screenshot] (each with a fallback),
//   and the PR body (findings) in a <pre>/text block.
```
All fetches wrapped so the page never crashes (advisory/read-only). Render each image with an `alt` + a "not available" fallback. Use `review.module.css` (frontend-design).

- [ ] **Step 2: Link pending rows to the review page in `ComponentTable.tsx`**

In the links cell, when `c.status === "pending"`, add (alongside the existing PR link):
```tsx
<a href={`/review/${c.slug}`}>Review</a>
```
(An internal link — same-origin, gated by middleware.)

- [ ] **Step 3: Verify + commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsc --noEmit
AUTH_SECRET=test-only corepack pnpm -F @d-2-g-8/design-system-admin build
```
Expected: tsc clean; build green (the `/review/[slug]` route is `ƒ` dynamic; no crash with no GitHub env because fetches are `.catch`-guarded). Commit `app/review/[slug]/page.tsx`, `app/review/review.module.css`, `app/components/ComponentTable.tsx` with:
`feat(admin): read-only review page — findings + Figma vs screenshot side-by-side`.

---

## Task 5: Full verify + docs/ops

**Files:** MODIFY `docs/design-system-admin/phase4b-i-login-review.md` (+ `apps/admin/README.md` auth/ops note).

- [ ] **Step 1: Full verification**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm install
corepack pnpm -r typecheck
corepack pnpm --filter @d-2-g-8/design-system-admin test
AUTH_SECRET=test-only corepack pnpm -F @d-2-g-8/design-system-admin build
corepack pnpm -F @d-2-g-8/design-system build          # library unaffected
corepack pnpm --filter @d-2-g-8/codegen test            # codegen unaffected
grep -m1 lockfileVersion pnpm-lock.yaml                 # v9
```
Expected: `-r typecheck` green; admin fixtures (auth-policy + github-review + design-state + run-correlation) pass; admin build green with `AUTH_SECRET`; library + codegen unaffected; lockfile v9.

- [ ] **Step 2: Generality + no cross-repo edits**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
! grep -rnE "slug\s*===\s*['\"]|['\"](button|chip|avatar)['\"]" apps/admin/lib apps/admin/app && echo "GENERAL"
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app && git status --porcelain
```
Expected: `GENERAL`; `ai-tools-app` empty.

- [ ] **Step 3: Docs/ops** — update `apps/admin/README.md` with the OAuth-app + `AUTH_*` + `ADMIN_ORG`/`ADMIN_GITHUB_USERS` + `FIGMA_ACCESS_TOKEN` setup and that the login is now the primary human gate (deployment protection → defense-in-depth); note the build needs `AUTH_SECRET`. Add the same to the spec's ops section if not precise.

- [ ] **Step 4: Commit** `docs/...phase4b-i-login-review.md` + `apps/admin/README.md` with:
`docs(phase4b-i): auth + review ops/preconditions`.

---

## Self-Review notes (checked against the spec)

- **Coverage:** login/policy → Task 1; session-gated actions + header → Task 2; review data helpers → Task 3; review page + links → Task 4; verify/docs → Task 5.
- **Auth model:** org-membership (pure `isAllowedGitHubUser` + impure org check in `signIn`) with allowlist override; middleware gates the app (excludes `/api/*` bearer); server actions require a session (replaces the 4a `ADMIN_TOKEN` guard). `/api/*` unchanged.
- **Compat gate:** Task 1 verifies `next-auth@beta` on Next 16 before building the rest; documented hand-rolled fallback on BLOCKED.
- **Build invariant:** relaxed to "green with a throwaway `AUTH_SECRET`" (documented).
- **Review:** findings from the PR body; the committed baseline via `getFileBase64` on the PR head; the Figma design via `fetchNodeImageDataUrl` (admin `FIGMA_ACCESS_TOKEN`); side-by-side; all fetches `.catch`-guarded so the page never crashes.
- **Generality:** manifest/git-driven, no hardcoded names. **Boundary:** no merge, no deep Storybook embed (4b-ii/later).
- **Type consistency:** `getPullRequestForSlug` → `{number, body, htmlUrl, headRef}`; `getFileBase64` → base64 string|null; `fetchNodeImageDataUrl` → data-url string|null; `ComponentState.status === 'pending'` gates the Review link.
```
