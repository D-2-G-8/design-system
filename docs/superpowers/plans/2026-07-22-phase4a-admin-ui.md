# Phase 4a — Admin UI (Lean Dashboard) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `apps/admin` skeleton into a usable dashboard — list every component with its git-derived status (committed / pending-PR / never), generate/regenerate buttons, live job progress, and PR/Storybook links.

**Architecture:** Server Components read component state from the GitHub API (git = truth; the admin is serverless) and jobs from Postgres; Server Actions dispatch generation and poll job status — so the browser never holds a token (humans are gated by Vercel deployment protection). The existing bearer-gated `/api/*` routes stay for programmatic callers. In-app validation review + merge-from-UI + a bespoke login are Phase 4b.

**Tech Stack:** Next.js 16 (App Router, React 19 Server Components + Server Actions), TypeScript 5.9, CSS Modules (no new deps), `tsx`/`node:test`, the existing `lib/{jobs,github,run-correlation,auth}`.

## Global Constraints

- **Spec:** `design-system/docs/design-system-admin/phase4a-admin-ui.md` — source of truth; every task defers to it.
- **Branch:** `phase4a-admin-ui`, off `master` (tip = 3b merge `be88e6b` or later — pull first). NEVER commit to master; NEVER `git add -A`.
- **Locked decisions:** lean 4a (dashboard + generate/regenerate + live progress + PR/Storybook links; review-via-PR-link); auth = Vercel deployment protection + server components/actions (no browser token); state derived from the GitHub API (manifest + committed dirs + open `codegen/<slug>` PRs); 4a Storybook link = stand root (`DESIGN_SYSTEM_STORYBOOK_URL`) or PR.
- **No new dependencies.** UI = CSS Modules (Next built-in). All privileged calls (GitHub/DB/dispatch) run server-side.
- **Reuse (do not reimplement):** `enqueue`/`list`/`get`/`setStatus`/`Job`/`JobStatus` (`@/lib/jobs`); `dispatchGenerate`/`getWorkflowRun`/`findRunByJobId`/`getConfig`/`githubFetch` (`@/lib/github`); `mapRunToJobStatus` (`@/lib/run-correlation`). Extract the `jobs/[id]` route's sync logic into a shared `syncJob` (DRY) rather than duplicating it.
- **No-env build safety:** the dashboard page is `dynamic = "force-dynamic"` and `.catch`es a missing-GitHub-config into a friendly panel, so `next build` stays green with no env (lib env is already lazy).
- **Discipline:** everything GENERAL — the component list comes from the manifest, statuses are derived, no hardcoded component names. English only. `cd` into the repo dir each shell call. Use `corepack pnpm`.
- **UI task uses the frontend-design skill** for the visual layer (calm internal-tool look, clear status badges, one obvious primary action per row) — the plan fixes the data/wiring; frontend-design shapes the look.
- **Out of scope (4b):** in-app validation review, merge-from-UI, deep per-story Storybook links, bespoke OAuth login, batch/search/pagination.

## File Structure

```
apps/admin/lib/
  github.ts        MODIFY — getFileContent / listDirEntries / listOpenCodegenPRs
  design-state.ts  NEW — deriveComponentState (pure) + loadComponentState
  jobs-sync.ts     NEW — syncJob (extracted from the jobs/[id] route)
apps/admin/app/
  actions.ts       NEW — "use server": generateComponent, getJobStatus
  api/jobs/[id]/route.ts   MODIFY — call syncJob (DRY, no behavior change)
  page.tsx         MODIFY — real dashboard (server, dynamic)
  components/      NEW — ComponentTable (server) + StatusBadge + GenerateButton (client) + JobsPanel (client) + dashboard.module.css
apps/admin/test/
  design-state.test.ts   NEW
```

---

## Task 1: Component-state reader (`design-state.ts` + GitHub read helpers)

**Files:**
- Create branch `phase4a-admin-ui`; commit the spec.
- Modify: `apps/admin/lib/github.ts`
- Create: `apps/admin/lib/design-state.ts`
- Test: `apps/admin/test/design-state.test.ts`

**Interfaces:**
- Produces (`github.ts`): `getFileContent(path, ref?)`, `listDirEntries(path, ref?)`, `listOpenCodegenPRs()`.
- Produces (`design-state.ts`): `deriveComponentState(manifest, committedComponents, committedIcons, prsByBranch): ComponentState[]`, `loadComponentState(): Promise<ComponentState[]>`, `interface ComponentState { slug; name; isIcon; status: 'committed'|'pending'|'never'; prUrl? }`.

- [ ] **Step 1: Branch + commit the spec**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git checkout master && git pull --ff-only
git checkout -b phase4a-admin-ui
git add docs/design-system-admin/phase4a-admin-ui.md
git commit -m "docs(phase4a): admin UI (lean dashboard) spec

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

- [ ] **Step 2: Add the GitHub read helpers to `apps/admin/lib/github.ts`**

Append (reuse the existing `getConfig`/`githubFetch`):
```ts
/** Read a file's decoded UTF-8 content from the repo at `ref` (default master).
 *  Null on 404. */
export async function getFileContent(path: string, ref = "master"): Promise<string | null> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/contents/${path}?ref=${ref}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`getFileContent ${path}: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { content?: string };
  return data.content ? Buffer.from(data.content, "base64").toString("utf8") : null;
}

/** List a directory's immediate entry names at `ref` (default master). Empty on
 *  404 (dir not created yet). */
export async function listDirEntries(path: string, ref = "master"): Promise<string[]> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/contents/${path}?ref=${ref}`);
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`listDirEntries ${path}: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { name: string }[];
  return Array.isArray(data) ? data.map((e) => e.name) : [];
}

/** Open PRs whose head branch is `codegen/*` → Map<headBranch, html_url>. */
export async function listOpenCodegenPRs(): Promise<Map<string, string>> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/pulls?state=open&per_page=100`);
  if (!res.ok) throw new Error(`listOpenCodegenPRs: ${res.status} ${await res.text()}`);
  const prs = (await res.json()) as { head: { ref: string }; html_url: string }[];
  const map = new Map<string, string>();
  for (const pr of prs) if (pr.head?.ref?.startsWith("codegen/")) map.set(pr.head.ref, pr.html_url);
  return map;
}
```

- [ ] **Step 3: Write the failing test `apps/admin/test/design-state.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveComponentState } from "../lib/design-state";

const manifest = {
  components: [
    { slug: "button", name: "Button", isIcon: false },
    { slug: "chip", name: "Chip", isIcon: false },
    { slug: "dialog", name: "Dialog", isIcon: false },
  ],
  icons: [{ slug: "plus", name: "Plus", isIcon: true }],
};

test("committed when the component's dir exists on master", () => {
  const s = deriveComponentState(manifest, ["button"], [], new Map());
  assert.equal(s.find((c) => c.slug === "button")?.status, "committed");
});

test("pending when an open codegen/<slug> PR exists and no dir", () => {
  const s = deriveComponentState(manifest, ["button"], [], new Map([["codegen/chip", "https://gh/pr/2"]]));
  const chip = s.find((c) => c.slug === "chip");
  assert.equal(chip?.status, "pending");
  assert.equal(chip?.prUrl, "https://gh/pr/2");
});

test("never when neither a dir nor a PR", () => {
  const s = deriveComponentState(manifest, ["button"], [], new Map());
  assert.equal(s.find((c) => c.slug === "dialog")?.status, "never");
});

test("icons use the icons dir list, not the components list", () => {
  const s = deriveComponentState(manifest, [], ["plus"], new Map());
  assert.equal(s.find((c) => c.slug === "plus")?.status, "committed");
});

test("a dir AND a PR resolves as committed (dir wins)", () => {
  const s = deriveComponentState(manifest, ["button"], [], new Map([["codegen/button", "https://gh/pr/1"]]));
  assert.equal(s.find((c) => c.slug === "button")?.status, "committed");
});
```

- [ ] **Step 4: RED**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsx --test test/design-state.test.ts
```
Expected: FAIL — `Cannot find module '../lib/design-state'`.

- [ ] **Step 5: Write `apps/admin/lib/design-state.ts`**

```ts
import { getFileContent, listDirEntries, listOpenCodegenPRs } from "./github";

export interface ComponentState {
  slug: string;
  name: string;
  isIcon: boolean;
  status: "committed" | "pending" | "never";
  prUrl?: string;
}

interface ManifestEntry { slug: string; name: string; isIcon: boolean }
interface Manifest { components: ManifestEntry[]; icons: ManifestEntry[] }

/** Pure: derive each manifest component's status from git facts. Committed if
 *  its dir exists on master; else pending if an open codegen/<slug> PR exists;
 *  else never. */
export function deriveComponentState(
  manifest: Manifest,
  committedComponents: string[],
  committedIcons: string[],
  prsByBranch: Map<string, string>,
): ComponentState[] {
  const all = [...(manifest.components ?? []), ...(manifest.icons ?? [])];
  return all.map((e) => {
    const committed = (e.isIcon ? committedIcons : committedComponents).includes(e.slug);
    if (committed) return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "committed" };
    const prUrl = prsByBranch.get(`codegen/${e.slug}`);
    if (prUrl) return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "pending", prUrl };
    return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "never" };
  });
}

/** Load component state live from GitHub (manifest + committed dirs + open PRs). */
export async function loadComponentState(): Promise<ComponentState[]> {
  const raw = await getFileContent("design-system.manifest.json");
  if (!raw) throw new Error("design-system.manifest.json not found on master");
  const manifest = JSON.parse(raw) as Manifest;
  const [components, icons, prs] = await Promise.all([
    listDirEntries("packages/components/src/components"),
    listDirEntries("packages/components/src/icons"),
    listOpenCodegenPRs(),
  ]);
  return deriveComponentState(manifest, components, icons, prs);
}
```

- [ ] **Step 6: GREEN + typecheck**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsx --test test/design-state.test.ts
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsc --noEmit
```
Expected: 5/5 pass; `tsc --noEmit` exit 0.

- [ ] **Step 7: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/lib/github.ts apps/admin/lib/design-state.ts apps/admin/test/design-state.test.ts
git commit -m "feat(admin): derive component status from git (manifest + committed dirs + open PRs)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 2: Shared `syncJob` + server actions

**Files:**
- Create: `apps/admin/lib/jobs-sync.ts`
- Modify: `apps/admin/app/api/jobs/[id]/route.ts`
- Create: `apps/admin/app/actions.ts`

**Interfaces:**
- Produces: `syncJob(id): Promise<{ job: Job | undefined; run: unknown }>`; `generateComponent(slug): Promise<{ jobId: string }>`; `getJobStatus(jobId): Promise<{ job: Job | undefined; run: unknown }>`.

- [ ] **Step 1: Write `apps/admin/lib/jobs-sync.ts` (extracted from the route, behavior-preserving)**

```ts
import { get, setStatus, type Job } from "./jobs";
import { findRunByJobId, getWorkflowRun } from "./github";
import { mapRunToJobStatus } from "./run-correlation";

/** Resolve a job's workflow run (correlating by run-name when the id isn't
 *  stored yet), sync the job's status from the run, and return the fresh job.
 *  Never throws on a GitHub outage -- the job row stays authoritative
 *  (a run error is returned as `run = { error }`). */
export async function syncJob(id: string): Promise<{ job: Job | undefined; run: unknown }> {
  const job = await get(id);
  if (!job) return { job: undefined, run: null };
  let run: unknown = null;
  let runId = job.workflow_run_id;
  if (!runId) {
    try {
      const found = await findRunByJobId(id);
      if (found) { runId = String(found.id); await setStatus(id, mapRunToJobStatus(found), { workflow_run_id: runId }); run = found; }
    } catch (e) { run = { error: e instanceof Error ? e.message : String(e) }; }
  }
  if (runId && !run) {
    try {
      const fetched = await getWorkflowRun(runId);
      await setStatus(id, mapRunToJobStatus(fetched));
      run = fetched;
    } catch (e) { run = { error: e instanceof Error ? e.message : String(e) }; }
  }
  const fresh = (await get(id)) ?? job;
  return { job: fresh, run };
}
```

- [ ] **Step 2: Refactor `app/api/jobs/[id]/route.ts` to use `syncJob`**

Replace the GET body's inline resolve/sync (everything from `const job = await get(id)` through the return, inside the existing outer try/catch) with:
```ts
    const { job, run } = await syncJob(id);
    if (!job) return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
    return NextResponse.json({ ok: true, job, run });
```
Keep the imports it still needs (`NextResponse`, `requireAdmin`), add `import { syncJob } from "@/lib/jobs-sync";`, and remove now-unused imports (`get`, `getWorkflowRun`, `findRunByJobId`, `setStatus`, `mapRunToJobStatus`) if they're no longer referenced. Keep the `requireAdmin` gate and the outer try/catch (500 only on a genuine failure).

- [ ] **Step 3: Write `apps/admin/app/actions.ts`**

```ts
"use server";

import { enqueue, setStatus } from "@/lib/jobs";
import { dispatchGenerate } from "@/lib/github";
import { syncJob } from "@/lib/jobs-sync";

/** Enqueue a generate job and dispatch the workflow. Runs server-side (the
 *  browser holds no token; humans are gated by Vercel deployment protection). */
export async function generateComponent(slug: string): Promise<{ jobId: string }> {
  if (!slug || !slug.trim()) throw new Error("slug is required");
  const job = await enqueue("generate", slug);
  try {
    await dispatchGenerate(slug, job.id);
  } catch (e) {
    await setStatus(job.id, "failed", { log: e instanceof Error ? e.message : String(e) });
    throw e;
  }
  return { jobId: job.id };
}

/** Live job status for the dashboard's polling (server action → no browser token). */
export async function getJobStatus(jobId: string) {
  return syncJob(jobId);
}
```

- [ ] **Step 4: Typecheck + admin build (no env)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsc --noEmit
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsx --test test/*.test.ts
corepack pnpm -F @d-2-g-8/design-system-admin build
```
Expected: `tsc --noEmit` exit 0; existing tests (run-correlation + design-state) pass; `next build` succeeds with no env (routes/actions lazy-load env). Note: `syncJob` is DB+GitHub glue extracted verbatim — its correctness is covered by the pre-existing run-correlation fixtures + the build; no new unit test.

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/lib/jobs-sync.ts apps/admin/app/api/jobs/\[id\]/route.ts apps/admin/app/actions.ts
git commit -m "feat(admin): shared syncJob + server actions (generate, job status) — no browser token

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 3: The dashboard UI

**Files:**
- Modify: `apps/admin/app/page.tsx`
- Create: `apps/admin/app/components/ComponentTable.tsx`, `StatusBadge.tsx`, `GenerateButton.tsx` (client), `JobsPanel.tsx` (client), `dashboard.module.css`

**Interfaces:** consumes `loadComponentState`, `listJobs` (`@/lib/jobs` `list`), the server actions `generateComponent`/`getJobStatus`.

**REQUIRED SUB-SKILL:** invoke **frontend-design** before writing the UI — it shapes the visual layer (status-badge palette, table calm, spacing, the primary-action treatment). The wiring below is the fixed contract; frontend-design decides the look. Keep it one dashboard page.

- [ ] **Step 1: Invoke frontend-design and write the dashboard page (`app/page.tsx`)**

Server component, dynamic, with a no-config fallback:
```tsx
import { loadComponentState } from "@/lib/design-state";
import { list as listJobs } from "@/lib/jobs";
import { ComponentTable } from "./components/ComponentTable";
import { JobsPanel } from "./components/JobsPanel";
import styles from "./components/dashboard.module.css";

export const dynamic = "force-dynamic"; // reads GitHub/DB at request time; never at build

export default async function Dashboard() {
  const state = await loadComponentState().catch((e) => (e instanceof Error ? e.message : String(e)));
  const jobs = await list().catch(() => []); // list = listJobs; recent jobs (empty if DB unconfigured)
  if (typeof state === "string") {
    return (
      <main className={styles.main}>
        <h1>Design System Admin</h1>
        <p className={styles.error}>Not configured: {state}. Set GITHUB_TOKEN + GITHUB_DESIGN_SYSTEM_REPO.</p>
      </main>
    );
  }
  return (
    <main className={styles.main}>
      <h1>Design System Admin</h1>
      <ComponentTable state={state} storybookUrl={process.env.DESIGN_SYSTEM_STORYBOOK_URL ?? null} />
      <JobsPanel initialJobs={jobs} />
    </main>
  );
}
```
(Fix the `list`/`listJobs` import naming so it's consistent — import `list as listJobs` and call `listJobs()`.)

- [ ] **Step 2: `StatusBadge.tsx` + `ComponentTable.tsx` (server) + `GenerateButton.tsx` (client)**

`StatusBadge` maps `status` → a labeled badge (committed / pending / never) with a CSS-module class per status. `ComponentTable` (server) renders the rows: name, kind, `<StatusBadge>`, a `<GenerateButton slug label>` (label "Generate" when never, "Regenerate" otherwise), a PR link when `prUrl`, and a Storybook link (`storybookUrl` root) when committed and `storybookUrl` is set. `GenerateButton` is a client component:
```tsx
"use client";
import { useState } from "react";
import { generateComponent } from "../actions";

export function GenerateButton({ slug, label }: { slug: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <>
      <button disabled={busy} onClick={async () => {
        setBusy(true); setErr(null);
        try { await generateComponent(slug); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
        finally { setBusy(false); }
      }}>{busy ? "Dispatching…" : label}</button>
      {err && <span role="alert">{err}</span>}
    </>
  );
}
```
(frontend-design shapes the badge palette, button, and table styling in `dashboard.module.css`.)

- [ ] **Step 3: `JobsPanel.tsx` (client, live polling via the server action)**

```tsx
"use client";
import { useEffect, useState } from "react";
import { getJobStatus } from "../actions";
import type { Job } from "@/lib/jobs";

export function JobsPanel({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState(initialJobs);
  useEffect(() => {
    const active = jobs.filter((j) => j.status === "queued" || j.status === "running").map((j) => j.id);
    if (active.length === 0) return;
    const t = setInterval(async () => {
      const results = await Promise.all(active.map((id) => getJobStatus(id).then((r) => r.job).catch(() => null)));
      setJobs((prev) => prev.map((j) => results.find((r) => r?.id === j.id) ?? j));
    }, 4000);
    return () => clearInterval(t);
  }, [jobs]);
  // render: each job's slug, status, created_at, and a run link when available.
  // frontend-design shapes the list; the polling contract above is fixed.
  return <section aria-label="Recent jobs">{/* frontend-design: render `jobs` */}</section>;
}
```
Note: newly-dispatched jobs (from `GenerateButton`) appear on the next page refresh; live status of already-listed active jobs updates via the poll. (Optimistic insert of a just-dispatched job into the panel is a nice-to-have — keep 4a simple.)

- [ ] **Step 4: Typecheck + admin build (no env)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsc --noEmit
corepack pnpm -F @d-2-g-8/design-system-admin build
```
Expected: `tsc --noEmit` exit 0; `next build` green with no env (the page's `.catch` renders the no-config panel; `dynamic` keeps it out of static prerender). If `next build` tries to prerender the page and fails on missing env, confirm `dynamic = "force-dynamic"` is set.

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/app/page.tsx apps/admin/app/components
git commit -m "feat(admin): dashboard — component status table + generate/regenerate + live jobs panel

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 4: Full verify + docs/ops

**Files:**
- Modify: `docs/design-system-admin/phase4a-admin-ui.md` (append the live-smoke + ops note if not precise).

- [ ] **Step 1: Full verification**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm install
corepack pnpm -r typecheck
corepack pnpm --filter @d-2-g-8/design-system-admin test
corepack pnpm -F @d-2-g-8/design-system-admin build
corepack pnpm -F @d-2-g-8/design-system build      # library unaffected
corepack pnpm --filter @d-2-g-8/codegen test        # codegen unaffected
grep -m1 lockfileVersion pnpm-lock.yaml             # stays '9.0'
```
Expected: `-r typecheck` green (admin + codegen + components); admin tests (design-state + run-correlation) pass; `next build` green with no env; library + codegen unaffected; lockfile v9.

- [ ] **Step 2: Generality + no cross-repo edits**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
! grep -rnE "slug\s*===\s*['\"]|['\"](button|chip|avatar)['\"]" apps/admin/lib apps/admin/app && echo "GENERAL: no per-component hardcoding"
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app && git status --porcelain
```
Expected: `GENERAL: ...`; `ai-tools-app` working tree empty.

- [ ] **Step 3: Document the live smoke + ops**

Ensure the spec's Preconditions section is accurate and add:
```markdown
### Live smoke (user-gated)
Deploy apps/admin to Vercel with deployment protection ON, GITHUB_TOKEN (repo
contents + PR read) + GITHUB_DESIGN_SYSTEM_REPO, Postgres attached, and optionally
DESIGN_SYSTEM_STORYBOOK_URL. Open the dashboard: it lists every manifest component
with committed/pending/never status; "Generate"/"Regenerate" dispatches the
workflow (visible in the jobs panel as queued→running→done, with a run link); a
pending component links to its open PR.
```

- [ ] **Step 4: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add docs/design-system-admin/phase4a-admin-ui.md
git commit -m "docs(phase4a): live-smoke + ops preconditions

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Self-Review notes (checked against the spec)

- **Spec coverage:** Part A (state reader) → Task 1; Part B (syncJob + actions) → Task 2; Part C (dashboard UI) → Task 3; testing/preconditions → Task 4.
- **Auth model:** no browser token — the page uses server components (`loadComponentState`, `listJobs`) + server actions (`generateComponent`, `getJobStatus`); `/api/*` bearer routes unchanged (Task 2 refactor is behavior-preserving). Humans gated by Vercel deployment protection (ops).
- **State = git:** `deriveComponentState` is pure + unit-tested; `loadComponentState` reads manifest + committed dirs + open PRs via the GitHub API.
- **No-env build safety:** dynamic page + `.catch` fallback + lazy lib env → `next build` green with no env (Task 2/3/4 verify).
- **Generality:** component list from the manifest, statuses derived, no hardcoded names (Task 4 grep). No new deps (CSS Modules).
- **DRY:** `syncJob` shared by the route + the `getJobStatus` action (no duplicated correlation logic).
- **Boundary:** no in-app review, no merge, no deep story links, no bespoke login — all 4b.
- **Type consistency:** `ComponentState.status` ∈ 'committed'|'pending'|'never'; `Job.status` (from `lib/jobs`) ∈ 'queued'|'running'|'done'|'failed'; the jobs panel polls `getJobStatus` → `{ job, run }`.
```
