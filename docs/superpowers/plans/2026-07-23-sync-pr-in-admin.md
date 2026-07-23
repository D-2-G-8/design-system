# Sync PR in Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user review the Figma metadata-sync PR, accept it into master, and selectively generate components — entirely from the admin, with correct status after merge.

**Architecture:** Fix status derivation to read the git tree (committed = real code, not a seed contract). Add a `/review/sync` screen that diffs the catalog (master vs `sync/figma`) and accepts the PR via the existing gated-merge machinery. Add multi-select generation on the dashboard. All new logic that can be pure is pure and unit-tested; UI/actions are verified by build + manual E2E.

**Tech Stack:** Next.js 16 (App Router, server components + server actions), next-auth 5 beta, `postgres`, GitHub REST, `node:test` via `tsx`.

## Global Constraints

- Work on a feature branch off `master` (e.g. `sync-pr-in-admin`). **NEVER commit to master. Each commit needs the user's explicit OK** (global rule) — the commit steps below are gated on that.
- Use `corepack pnpm` for every pnpm invocation (bare `pnpm` is the wrong major and corrupts the lockfile).
- cwd resets between shells — `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin` (or the repo root) explicitly in every bash call.
- Tests run from `apps/admin`: `corepack pnpm test` → `tsx --test test/*.test.ts`. Tests are `node:test` + `node:assert/strict`, importing pure functions from `../lib`.
- Typecheck: from `apps/admin`, `corepack pnpm exec tsc --noEmit`. Build: `AUTH_SECRET=throwaway-build-secret corepack pnpm build` (build fails typecheck without a dummy `AUTH_SECRET`).
- Route handlers use `NextResponse.json`, never `Response.json`.
- Manifest shape: `{ figmaFileKey?: string; components: ManifestEntry[]; icons: ManifestEntry[] }`, `ManifestEntry = { slug: string; name: string; isIcon: boolean }`.
- `tokens/tokens.json` shape: flat `Record<string, { category: string; value: string }>`.
- Sync PR: head ref `sync/figma`, base `master`. Component PRs: head ref `codegen/<slug>`.

---

## Task 0: Preflight — land this session's pending fixes on the branch

**Files (already edited this session, uncommitted):**
- Modify: `apps/admin/app/actions.ts` (server actions return `{ok,error}` instead of throwing)
- Modify: `apps/admin/app/components/SyncButton.tsx`, `apps/admin/app/components/GenerateButton.tsx`
- Modify: `apps/admin/app/components/JobsPanel.tsx` (re-seed state from `initialJobs`)
- Modify: `.github/workflows/sync.yml`, `.github/workflows/generate.yml` (PAT for create-pull-request)
- Modify: `.gitignore` (ignore `.env`/`.env.local`)

- [ ] **Step 1: Create the feature branch**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git checkout -b sync-pr-in-admin
```

- [ ] **Step 2: Verify the tree is clean-of-secrets and typechecks**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && git check-ignore .env.local && echo IGNORED
cd apps/admin && corepack pnpm exec tsc --noEmit && echo TSC_OK
```
Expected: `IGNORED` then `TSC_OK`.

- [ ] **Step 3: Commit (needs user OK)** — split into two commits

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add .github/workflows/sync.yml .github/workflows/generate.yml
git commit -m "fix(ci): open codegen/sync PRs with a PAT so they trigger CI"
git add apps/admin/app/actions.ts apps/admin/app/components/SyncButton.tsx apps/admin/app/components/GenerateButton.tsx apps/admin/app/components/JobsPanel.tsx .gitignore
git commit -m "fix(admin): surface real server-action errors + live jobs refresh + ignore .env"
```

---

## Task 1: Pure committed-from-tree helper

**Files:**
- Create: `apps/admin/lib/committed.ts`
- Test: `apps/admin/test/committed.test.ts`

**Interfaces:**
- Produces: `committedSlugsFromTree(blobPaths: string[], baseDir: string): string[]`

- [ ] **Step 1: Write the failing test**

Create `apps/admin/test/committed.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { committedSlugsFromTree } from "../lib/committed";

const BASE = "packages/components/src/components";

test("a dir with only a contract seed is NOT committed", () => {
  const paths = [`${BASE}/accordion/accordion.contract.json`];
  assert.deepEqual(committedSlugsFromTree(paths, BASE), []);
});

test("a dir with a .tsx IS committed", () => {
  const paths = [
    `${BASE}/button/button.contract.json`,
    `${BASE}/button/Button.tsx`,
  ];
  assert.deepEqual(committedSlugsFromTree(paths, BASE), ["button"]);
});

test("a dir with index.ts IS committed", () => {
  const paths = [`${BASE}/chip/index.ts`];
  assert.deepEqual(committedSlugsFromTree(paths, BASE), ["chip"]);
});

test("only real-code slugs are returned, seeds excluded", () => {
  const paths = [
    `${BASE}/button/Button.tsx`,
    `${BASE}/accordion/accordion.contract.json`,
    `${BASE}/chip/index.ts`,
  ];
  assert.deepEqual(committedSlugsFromTree(paths, BASE).sort(), ["button", "chip"]);
});

test("paths outside baseDir and files directly in baseDir are ignored", () => {
  const paths = [
    `${BASE}.json`,
    `${BASE}/README.md`,
    `packages/components/src/icons/plus/Plus.tsx`,
  ];
  assert.deepEqual(committedSlugsFromTree(paths, BASE), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin && corepack pnpm exec tsx --test test/committed.test.ts`
Expected: FAIL — cannot find module `../lib/committed`.

- [ ] **Step 3: Write minimal implementation**

Create `apps/admin/lib/committed.ts`:
```ts
/**
 * Given every blob path in the repo tree and a base dir like
 * "packages/components/src/components", return the slugs (immediate subdir
 * names) whose directory holds real generated code -- a `*.tsx` file or an
 * `index.ts` -- as opposed to a directory that holds only a
 * `<slug>.contract.json` seed written by the metadata sync. This is what makes
 * a component read as "committed" on the dashboard.
 */
export function committedSlugsFromTree(blobPaths: string[], baseDir: string): string[] {
  const prefix = baseDir.endsWith("/") ? baseDir : baseDir + "/";
  const slugs = new Set<string>();
  for (const p of blobPaths) {
    if (!p.startsWith(prefix)) continue;
    const rest = p.slice(prefix.length); // "<slug>/<...>/<file>"
    const firstSlash = rest.indexOf("/");
    if (firstSlash < 0) continue; // a file directly in baseDir, not inside a slug dir
    const slug = rest.slice(0, firstSlash);
    const file = rest.slice(rest.lastIndexOf("/") + 1);
    if (file === "index.ts" || file.endsWith(".tsx")) slugs.add(slug);
  }
  return [...slugs];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin && corepack pnpm exec tsx --test test/committed.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit (needs user OK)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/lib/committed.ts apps/admin/test/committed.test.ts
git commit -m "feat(admin): committed-from-tree helper (code, not seed contract)"
```

---

## Task 2: Wire tree-based committed derivation

**Files:**
- Modify: `apps/admin/lib/github.ts` (add `listTree`)
- Modify: `apps/admin/lib/design-state.ts` (`loadComponentState` uses the tree)

**Interfaces:**
- Consumes: `committedSlugsFromTree` (Task 1); `listOpenCodegenPRs`, `getFileContent` (existing)
- Produces: `listTree(ref?: string): Promise<{ paths: string[]; truncated: boolean }>`

- [ ] **Step 1: Add `listTree` to `apps/admin/lib/github.ts`**

Append near the other read helpers:
```ts
export interface TreeResult { paths: string[]; truncated: boolean }

/** Recursive git tree at `ref` (default master) -> all blob paths + the API's
 *  `truncated` flag. The caller MUST handle truncation rather than trust a
 *  partial list (a missing path would read as "not committed"). */
export async function listTree(ref = "master"): Promise<TreeResult> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/git/trees/${ref}?recursive=1`);
  if (!res.ok) throw new Error(`listTree ${ref}: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { tree?: { path: string; type: string }[]; truncated?: boolean };
  const paths = (data.tree ?? []).filter((e) => e.type === "blob").map((e) => e.path);
  return { paths, truncated: Boolean(data.truncated) };
}
```

- [ ] **Step 2: Rewrite `loadComponentState` in `apps/admin/lib/design-state.ts`**

Replace the imports line and the `loadComponentState` function. New top import:
```ts
import { getFileContent, listTree, listOpenCodegenPRs } from "./github";
import { committedSlugsFromTree } from "./committed";
```
New function (replaces the existing `loadComponentState`; `deriveComponentState` and the interfaces above it stay unchanged):
```ts
/** Load component state live from GitHub: manifest (master) + committed dirs
 *  derived from the recursive git tree (a dir counts as committed only if it
 *  holds real code, not just a sync-seeded contract.json) + open codegen PRs. */
export async function loadComponentState(): Promise<ComponentState[]> {
  const raw = await getFileContent("design-system.manifest.json");
  if (!raw) throw new Error("design-system.manifest.json not found on master");
  const manifest = JSON.parse(raw) as Manifest;
  const [tree, prs] = await Promise.all([listTree("master"), listOpenCodegenPRs()]);
  if (tree.truncated) throw new Error("git tree truncated -- cannot reliably derive committed state");
  const components = committedSlugsFromTree(tree.paths, "packages/components/src/components");
  const icons = committedSlugsFromTree(tree.paths, "packages/components/src/icons");
  return deriveComponentState(manifest, components, icons, prs);
}
```
(`listDirEntries` is no longer imported here; leave the function in `github.ts` — nothing else changes.)

- [ ] **Step 3: Verify existing derivation tests still pass + typecheck**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin
corepack pnpm exec tsc --noEmit && corepack pnpm test
```
Expected: `tsc` clean; all tests pass (the existing `design-state.test.ts` exercises `deriveComponentState`, whose signature is unchanged, so it stays green).

- [ ] **Step 4: Commit (needs user OK)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/lib/github.ts apps/admin/lib/design-state.ts
git commit -m "fix(admin): derive committed state from git tree, not dir existence"
```

---

## Task 3: Pure catalog + token diff

**Files:**
- Create: `apps/admin/lib/sync-diff.ts`
- Test: `apps/admin/test/sync-diff.test.ts`

**Interfaces:**
- Produces:
  - `ManifestEntry = { slug: string; name: string; isIcon: boolean }`
  - `Manifest = { figmaFileKey?: string; components?: ManifestEntry[]; icons?: ManifestEntry[] }`
  - `TokenEntry = { category: string; value: string }`
  - `diffEntries(base: ManifestEntry[], head: ManifestEntry[]): EntryDiff`
  - `diffCatalog(base: Manifest, head: Manifest): { components: EntryDiff; icons: EntryDiff }`
  - `diffTokens(base: Record<string, TokenEntry>, head: Record<string, TokenEntry>): TokenDiff`
  - `EntryDiff = { added: ManifestEntry[]; removed: ManifestEntry[]; renamed: { slug: string; from: string; to: string }[] }`
  - `TokenDiff = { added: string[]; removed: string[]; changed: { name: string; from: string; to: string }[] }`

- [ ] **Step 1: Write the failing test**

Create `apps/admin/test/sync-diff.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { diffCatalog, diffTokens } from "../lib/sync-diff";

test("catalog diff finds added, removed, renamed by slug", () => {
  const base = {
    components: [
      { slug: "button", name: "Button", isIcon: false },
      { slug: "chip", name: "Chip", isIcon: false },
    ],
    icons: [{ slug: "plus", name: "Plus", isIcon: true }],
  };
  const head = {
    components: [
      { slug: "button", name: "Button", isIcon: false },
      { slug: "badge", name: "Badge", isIcon: false }, // added
      // chip removed
    ],
    icons: [{ slug: "plus", name: "PlusBold", isIcon: true }], // renamed
  };
  const d = diffCatalog(base, head);
  assert.deepEqual(d.components.added.map((e) => e.slug), ["badge"]);
  assert.deepEqual(d.components.removed.map((e) => e.slug), ["chip"]);
  assert.deepEqual(d.icons.renamed, [{ slug: "plus", from: "Plus", to: "PlusBold" }]);
});

test("catalog diff tolerates missing arrays", () => {
  const d = diffCatalog({}, { components: [{ slug: "x", name: "X", isIcon: false }] });
  assert.deepEqual(d.components.added.map((e) => e.slug), ["x"]);
  assert.deepEqual(d.icons.added, []);
});

test("token diff finds added, removed, value-changed", () => {
  const base = {
    "color-000000": { category: "color", value: "#000000" },
    "color-fff": { category: "color", value: "#ffffff" },
  };
  const head = {
    "color-000000": { category: "color", value: "#111111" }, // changed
    "color-new": { category: "color", value: "#abcabc" }, // added
    // color-fff removed
  };
  const d = diffTokens(base, head);
  assert.deepEqual(d.added, ["color-new"]);
  assert.deepEqual(d.removed, ["color-fff"]);
  assert.deepEqual(d.changed, [{ name: "color-000000", from: "#000000", to: "#111111" }]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin && corepack pnpm exec tsx --test test/sync-diff.test.ts`
Expected: FAIL — cannot find module `../lib/sync-diff`.

- [ ] **Step 3: Write minimal implementation**

Create `apps/admin/lib/sync-diff.ts`:
```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin && corepack pnpm exec tsx --test test/sync-diff.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit (needs user OK)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/lib/sync-diff.ts apps/admin/test/sync-diff.test.ts
git commit -m "feat(admin): pure catalog + token diff for sync review"
```

---

## Task 4: Sync PR lookup + accept/close server actions

**Files:**
- Modify: `apps/admin/lib/github.ts` (add `getSyncPullRequest`, `closePullRequest`)
- Modify: `apps/admin/app/actions.ts` (add `acceptSyncPr`, `closeSyncPr`)

**Interfaces:**
- Consumes: `getPullRequestMergeState`, `canMerge`, `mergePullRequest` (existing), `requireSession` (existing, private in actions.ts)
- Produces:
  - `getSyncPullRequest(): Promise<{ number: number; htmlUrl: string; headRef: string } | null>`
  - `closePullRequest(number: number): Promise<void>`
  - `acceptSyncPr(): Promise<{ merged: boolean; reason?: string }>`
  - `closeSyncPr(): Promise<{ closed: boolean; reason?: string }>`

- [ ] **Step 1: Add `getSyncPullRequest` + `closePullRequest` to `apps/admin/lib/github.ts`**

```ts
/** The open sync/figma -> master PR, or null. */
export async function getSyncPullRequest(): Promise<{ number: number; htmlUrl: string; headRef: string } | null> {
  const { repo } = getConfig();
  const org = repo.split("/")[0];
  const res = await githubFetch(`/repos/${repo}/pulls?state=open&head=${org}:sync/figma`);
  if (!res.ok) throw new Error(`getSyncPullRequest: ${res.status} ${await res.text()}`);
  const prs = (await res.json()) as { number: number; html_url: string; head: { ref: string } }[];
  const pr = prs[0];
  return pr ? { number: pr.number, htmlUrl: pr.html_url, headRef: pr.head.ref } : null;
}

/** Close a PR without merging (PATCH state=closed). */
export async function closePullRequest(number: number): Promise<void> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/pulls/${number}`, {
    method: "PATCH",
    body: JSON.stringify({ state: "closed" }),
  });
  if (!res.ok) throw new Error(`closePullRequest ${number}: ${res.status} ${await res.text()}`);
}
```

- [ ] **Step 2: Add `acceptSyncPr` + `closeSyncPr` to `apps/admin/app/actions.ts`**

Extend the existing import from `@/lib/github` to include the new + reused names:
```ts
import {
  dispatchGenerate, dispatchSync, getPullRequestForSlug, getPullRequestMergeState,
  canMerge, mergePullRequest, getSyncPullRequest, closePullRequest,
} from "@/lib/github";
```
Append:
```ts
/** Merge the open sync/figma PR into master. Gated on the session AND re-checked
 *  server-side (mergeable + CI green) immediately before merging -- never trusts
 *  the client button's enabled state. Head-SHA guarded (squash). */
export async function acceptSyncPr(): Promise<{ merged: boolean; reason?: string }> {
  await requireSession();
  const pr = await getSyncPullRequest();
  if (!pr) return { merged: false, reason: "no open sync PR" };
  const state = await getPullRequestMergeState(pr.number);
  const gate = canMerge(state);
  if (!gate.ok) return { merged: false, reason: gate.reason };
  const res = await mergePullRequest(pr.number, state.headSha);
  return { merged: res.merged, reason: res.message };
}

/** Close the open sync/figma PR without merging (a fresh Resync re-opens it). */
export async function closeSyncPr(): Promise<{ closed: boolean; reason?: string }> {
  await requireSession();
  const pr = await getSyncPullRequest();
  if (!pr) return { closed: false, reason: "no open sync PR" };
  await closePullRequest(pr.number);
  return { closed: true };
}
```

- [ ] **Step 3: Typecheck + build**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin
corepack pnpm exec tsc --noEmit && AUTH_SECRET=throwaway-build-secret corepack pnpm build
```
Expected: `tsc` clean; build succeeds.

- [ ] **Step 4: Commit (needs user OK)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/lib/github.ts apps/admin/app/actions.ts
git commit -m "feat(admin): sync PR lookup + gated accept/close actions"
```

---

## Task 5: `/review/sync` screen + dashboard banner

**Files:**
- Create: `apps/admin/app/review/sync/page.tsx`
- Create: `apps/admin/app/review/sync/SyncActions.tsx` (client accept/close control)
- Modify: `apps/admin/app/page.tsx` (dashboard banner when a sync PR is open)
- Modify: `apps/admin/app/review/review.module.css` (reuse; add a couple of classes if needed)

**Interfaces:**
- Consumes: `getSyncPullRequest`, `getFileContent`, `getPullRequestMergeState`, `canMerge` (github); `diffCatalog`, `diffTokens`, `Manifest`, `TokenEntry` (sync-diff); `acceptSyncPr`, `closeSyncPr` (actions)

- [ ] **Step 1: Create the client accept/close control**

Create `apps/admin/app/review/sync/SyncActions.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptSyncPr, closeSyncPr } from "../../actions";
import styles from "../review.module.css";

/** Accept (gated merge) or close the sync PR. Server re-checks the gate; the
 *  `disabled` prop is only an advisory hint from the server render. */
export function SyncActions({ acceptDisabled, disabledReason }: { acceptDisabled: boolean; disabledReason: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className={styles.mergeCard}>
      <button
        type="button"
        className={styles.mergeBtn}
        disabled={busy || acceptDisabled}
        title={acceptDisabled ? disabledReason : undefined}
        onClick={async () => {
          setBusy(true);
          setMsg(null);
          const res = await acceptSyncPr();
          setBusy(false);
          if (res.merged) router.push("/");
          else setMsg(res.reason ?? "accept failed");
        }}
      >
        {busy ? "Working…" : "Accept catalog into master"}
      </button>
      <button
        type="button"
        className={styles.secondaryButton}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMsg(null);
          const res = await closeSyncPr();
          setBusy(false);
          if (res.closed) router.push("/");
          else setMsg(res.reason ?? "close failed");
        }}
      >
        Close without merging
      </button>
      {(msg || acceptDisabled) && (
        <p role="alert" className={styles.mergeStatusText}>
          {msg ?? disabledReason}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create the review screen**

Create `apps/admin/app/review/sync/page.tsx`:
```tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getSyncPullRequest, getFileContent, getPullRequestMergeState, canMerge } from "@/lib/github";
import { diffCatalog, diffTokens, type Manifest, type TokenEntry } from "@/lib/sync-diff";
import { SyncActions } from "./SyncActions";
import styles from "../review.module.css";

export const dynamic = "force-dynamic";

async function readManifest(ref: string): Promise<Manifest> {
  const raw = await getFileContent("design-system.manifest.json", ref).catch(() => null);
  if (!raw) return {};
  try { return JSON.parse(raw) as Manifest; } catch { return {}; }
}
async function readTokens(ref: string): Promise<Record<string, TokenEntry>> {
  const raw = await getFileContent("tokens/tokens.json", ref).catch(() => null);
  if (!raw) return {};
  try { return JSON.parse(raw) as Record<string, TokenEntry>; } catch { return {}; }
}

export default async function SyncReviewPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const pr = await getSyncPullRequest().catch(() => null);
  if (!pr) {
    return (
      <main className={styles.main}>
        <div className={styles.wrap}>
          <a className={styles.back} href="/">← Back to dashboard</a>
          <header className={styles.header}><p className={styles.eyebrow}>Sync review</p><h1>No open Figma sync</h1></header>
          <p className={styles.error}>There is no open sync PR. Click “Sync from Figma” on the dashboard first.</p>
        </div>
      </main>
    );
  }

  const [baseManifest, headManifest, baseTokens, headTokens, mergeState] = await Promise.all([
    readManifest("master"),
    readManifest(pr.headRef),
    readTokens("master"),
    readTokens(pr.headRef),
    getPullRequestMergeState(pr.number).catch(() => null),
  ]);

  const cat = diffCatalog(baseManifest, headManifest);
  const tok = diffTokens(baseTokens, headTokens);
  const gate = mergeState ? canMerge(mergeState) : { ok: false, reason: "could not read merge state" };

  const nameList = (xs: { name: string }[]) => xs.map((e) => e.name).join(", ") || "—";

  return (
    <main className={styles.main}>
      <div className={styles.wrap}>
        <a className={styles.back} href="/">← Back to dashboard</a>
        <header className={styles.header}>
          <p className={styles.eyebrow}>Sync review</p>
          <h1>Figma library sync</h1>
          <div className={styles.metaRow}>
            <a className={styles.prLink} href={pr.htmlUrl} target="_blank" rel="noreferrer">Open PR ↗</a>
          </div>
        </header>

        <section aria-labelledby="catalog-heading" className={styles.findings}>
          <h2 id="catalog-heading" className={styles.sectionHeading}>Catalog changes vs master</h2>
          <ul className={styles.diffList}>
            <li><strong>Components added ({cat.components.added.length}):</strong> {nameList(cat.components.added)}</li>
            <li><strong>Components removed ({cat.components.removed.length}):</strong> {nameList(cat.components.removed)}</li>
            <li><strong>Components renamed ({cat.components.renamed.length}):</strong> {cat.components.renamed.map((r) => `${r.from}→${r.to}`).join(", ") || "—"}</li>
            <li><strong>Icons added ({cat.icons.added.length}):</strong> <details><summary>show</summary>{nameList(cat.icons.added)}</details></li>
            <li><strong>Icons removed ({cat.icons.removed.length}):</strong> <details><summary>show</summary>{nameList(cat.icons.removed)}</details></li>
            <li><strong>Tokens:</strong> +{tok.added.length} / −{tok.removed.length} / ~{tok.changed.length} changed</li>
          </ul>
          <p className={styles.hint}>Something wrong, or missing? Fix the 🟢 marker in Figma and press “Sync from Figma” again.</p>
        </section>

        <section aria-labelledby="accept-heading" className={styles.mergePanel}>
          <h2 id="accept-heading" className={styles.sectionHeading}>Accept</h2>
          <p className={styles.mergeStatusText}>{mergeState ? <>CI: {mergeState.ciSummary}</> : gate.reason}</p>
          <SyncActions acceptDisabled={!gate.ok} disabledReason={gate.reason} />
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Add the dashboard banner**

In `apps/admin/app/page.tsx`, add the import at the top:
```tsx
import { getSyncPullRequest } from "@/lib/github";
```
In the `Dashboard` component, after `const jobs = await listJobs()...`, add:
```tsx
  const syncPr = await getSyncPullRequest().catch(() => null);
```
Then, inside the returned success JSX, immediately after `<SyncButton />`, add:
```tsx
          {syncPr && (
            <a className={styles.syncReviewBanner} href="/review/sync">
              New Figma sync ready to review →
            </a>
          )}
```

- [ ] **Step 4: Add the styles**

Append to `apps/admin/app/review/review.module.css`:
```css
.diffList { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
.diffList li { line-height: 1.5; }
.hint { margin-top: 12px; opacity: 0.75; font-size: 0.9em; }
.secondaryButton { margin-left: 8px; background: transparent; border: 1px solid currentColor; border-radius: 6px; padding: 8px 14px; cursor: pointer; }
```
Append to `apps/admin/app/components/dashboard.module.css`:
```css
.syncReviewBanner { display: inline-block; margin-top: 12px; padding: 8px 14px; border-radius: 6px; background: #1f6feb1a; color: inherit; text-decoration: none; font-weight: 600; }
```
Reused classes that already exist in `review.module.css`: `main`, `wrap`, `back`, `header`, `eyebrow`, `metaRow`, `prLink`, `sectionHeading`, `findings`, `mergePanel`, `mergeCard`, `mergeStatusText`, `mergeBtn`, `error`. **New** classes added by this task: `diffList`, `hint`, `secondaryButton` (review.module.css) and `syncReviewBanner` (dashboard.module.css). The `SelectableComponents` batch button reuses `buttonPrimary`, already in `dashboard.module.css`.

- [ ] **Step 5: Typecheck + build + manual smoke**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin
corepack pnpm exec tsc --noEmit && AUTH_SECRET=throwaway-build-secret corepack pnpm build
```
Expected: `tsc` clean; build succeeds (route `/review/sync` listed).
Manual (user-gated, on the deployed branch): open `/review/sync`, confirm it shows ~30 components added, 294 icons added, tokens added, CI status, and the Accept/Close buttons.

- [ ] **Step 6: Commit (needs user OK)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/app/review/sync apps/admin/app/page.tsx apps/admin/app/review/review.module.css apps/admin/app/components/dashboard.module.css
git commit -m "feat(admin): /review/sync screen + dashboard banner"
```

---

## Task 6: Multi-select generation on the dashboard

**Files:**
- Create: `apps/admin/app/components/SelectableComponents.tsx` (client: rows with checkboxes + batch bar)
- Modify: `apps/admin/app/components/ComponentTable.tsx` (delegate row rendering to the client component)
- Modify: `apps/admin/app/components/dashboard.module.css` (batch bar + checkbox styles)

**Interfaces:**
- Consumes: `generateComponent` (actions, returns `{ ok: true; jobId } | { ok: false; error }`); `ComponentState` (design-state); `StatusBadge`, `GenerateButton` (existing)

- [ ] **Step 1: Create the selectable client component**

Create `apps/admin/app/components/SelectableComponents.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ComponentState } from "@/lib/design-state";
import { generateComponent } from "../actions";
import { StatusBadge } from "./StatusBadge";
import { GenerateButton } from "./GenerateButton";
import styles from "./dashboard.module.css";

const ROW_CLASS: Record<ComponentState["status"], string> = {
  committed: styles.rowCommitted,
  pending: styles.rowPending,
  never: styles.rowNever,
};

/** Client table body: per-row Generate (existing) + checkbox multi-select with a
 *  "Generate selected (N)" bar. The batch is client-side orchestration over the
 *  existing per-slug `generateComponent` action (bounded concurrency). */
export function SelectableComponents({ state, storybookUrl }: { state: ComponentState[]; storybookUrl: string | null }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const selectable = state.filter((c) => c.status !== "pending"); // never + committed(regenerate)
  const allSelected = selectable.length > 0 && selectable.every((c) => selected.has(c.slug));

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(selectable.map((c) => c.slug)));
  }

  async function runBatch() {
    setBusy(true);
    const slugs = [...selected];
    const CONCURRENCY = 3;
    for (let i = 0; i < slugs.length; i += CONCURRENCY) {
      await Promise.all(slugs.slice(i, i + CONCURRENCY).map((s) => generateComponent(s).catch(() => null)));
    }
    setBusy(false);
    setSelected(new Set());
    router.refresh();
  }

  return (
    <>
      {selected.size > 0 && (
        <div className={styles.batchBar}>
          <span>{selected.size} selected</span>
          <button type="button" className={styles.buttonPrimary} disabled={busy} onClick={runBatch}>
            {busy ? "Dispatching…" : `Generate selected (${selected.size})`}
          </button>
        </div>
      )}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col"><input type="checkbox" aria-label="Select all" checked={allSelected} onChange={toggleAll} /></th>
              <th scope="col">Component</th>
              <th scope="col">Kind</th>
              <th scope="col">Status</th>
              <th scope="col">Links</th>
              <th scope="col"><span className={styles.visuallyHidden}>Action</span></th>
            </tr>
          </thead>
          <tbody>
            {state.map((c) => (
              <tr key={c.slug} className={ROW_CLASS[c.status]}>
                <td>
                  {c.status !== "pending" && (
                    <input type="checkbox" aria-label={`Select ${c.name}`} checked={selected.has(c.slug)} onChange={() => toggle(c.slug)} />
                  )}
                </td>
                <td className={styles.name}>{c.name}</td>
                <td className={styles.kind}>{c.isIcon ? "icon" : "component"}</td>
                <td><StatusBadge status={c.status} /></td>
                <td className={styles.links}>
                  {c.prUrl && <a href={c.prUrl} target="_blank" rel="noreferrer">View PR ↗</a>}
                  {c.status === "pending" && <a href={`/review/${c.slug}`}>Review</a>}
                  {c.status === "committed" && storybookUrl && <a href={storybookUrl} target="_blank" rel="noreferrer">Storybook ↗</a>}
                </td>
                <td className={styles.actionCell}>
                  <GenerateButton slug={c.slug} label={c.status === "never" ? "Generate" : "Regenerate"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Delegate `ComponentTable` to the client component**

Replace the `<div className={styles.tableWrap}>…</table></div>` block in `apps/admin/app/components/ComponentTable.tsx` with:
```tsx
        <SelectableComponents state={state} storybookUrl={storybookUrl} />
```
And add the import at the top:
```tsx
import { SelectableComponents } from "./SelectableComponents";
```
Remove the now-unused `ROW_CLASS`, `StatusBadge`, and `GenerateButton` imports from `ComponentTable.tsx` (they moved into `SelectableComponents`). Keep the `<section>`, heading, count, and the `state.length === 0` empty-state in `ComponentTable`.

- [ ] **Step 3: Add batch-bar + checkbox styles**

Append to `apps/admin/app/components/dashboard.module.css`:
```css
.batchBar { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 12px; padding: 10px 14px; margin-bottom: 8px; border-radius: 8px; background: #1f6feb22; }
```

- [ ] **Step 4: Typecheck + build**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin
corepack pnpm exec tsc --noEmit && AUTH_SECRET=throwaway-build-secret corepack pnpm build
```
Expected: `tsc` clean; build succeeds.
Manual (user-gated): on the dashboard, select 2-3 components, click “Generate selected”, confirm jobs appear in the Jobs panel.

- [ ] **Step 5: Commit (needs user OK)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/app/components/SelectableComponents.tsx apps/admin/app/components/ComponentTable.tsx apps/admin/app/components/dashboard.module.css
git commit -m "feat(admin): multi-select batch generation on the dashboard"
```

---

## Final verification

- [ ] **Full gate green**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin
corepack pnpm exec tsc --noEmit && corepack pnpm test && AUTH_SECRET=throwaway-build-secret corepack pnpm build
```
Expected: tsc clean; all tests pass (committed, sync-diff, design-state, and the pre-existing suites); build succeeds.

- [ ] **Open the PR** — `gh` is not installed; give the user the compare URL for `sync-pr-in-admin → master`. Do NOT push/merge without the user's OK.

## Manual E2E (user-gated, post-deploy)

1. Deploy the branch (Vercel) + ensure `CREATE_PR_TOKEN` secret is set (from the prior fix).
2. Click **Sync from Figma** → wait for the job → the dashboard shows **"New Figma sync ready to review →"**.
3. Open `/review/sync` → confirm the diff (≈30 components, 294 icons, tokens added) + CI status.
4. Click **Accept** once CI is green → returns to dashboard → catalog now shows 30 components + 294 icons, with `button` = committed and the rest = `never`.
5. Select 2-3 components → **Generate selected** → jobs appear; each opens a `codegen/<slug>` PR reviewable at `/review/<slug>`.
