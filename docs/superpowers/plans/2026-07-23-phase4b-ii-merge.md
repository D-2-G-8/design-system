# Phase 4b-ii — Merge-from-UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an authenticated reviewer **merge** a component's PR from `/review/[slug]`, but only when GitHub reports it **mergeable AND CI-green**, re-checked **server-side** immediately before merging, behind a confirm step.

**Architecture:** A pure `canMerge` decision over the PR's merge-state + CI check-runs gates a `MergeButton` (disabled-with-reason). The `mergeComponentPr` server action calls `requireSession()` first, RE-fetches merge-state server-side (never trusts the client), and merges (squash, head-SHA concurrency guard). The review page gains an explicit top-level `auth()` gate (the 4b-i follow-up). Nothing auto-merges; a human clicks + confirms; the dashboard row flips `committed` on next load (git = state).

**Tech Stack:** Next.js 16 (RSC + Server Actions), React 19, TypeScript 5.9, CSS Modules, `tsx`/`node:test`, the existing `lib/github` (`getConfig`/`githubFetch`), `@/auth`.

## Global Constraints

- **Spec:** `design-system/docs/design-system-admin/phase4b-ii-merge.md` — source of truth.
- **Branch:** `phase4b-ii-merge`, off `master` (pull first — 4b-i is merged, tip `ea34688`+). NEVER commit to master; NEVER `git add -A`.
- **Locked decisions:** merge enabled only when **mergeable (no conflicts) AND CI-green**; confirm step; server action **re-checks server-side** (never trusts the button); authz = `requireSession()` in the action FIRST + an in-code `auth()` gate at the top of `/review/[slug]`; merge method = **squash** (fixed, no UI choice); head-**SHA** concurrency guard.
- **Reuse (do not reimplement):** `getConfig`/`githubFetch`/`getPullRequestForSlug` (`@/lib/github`); `requireSession` pattern + `auth` (`@/auth`, `app/actions.ts`); `GenerateButton`'s busy/error + `router.refresh()` pattern.
- **Build invariant:** admin `next build` green with a throwaway `AUTH_SECRET` (the merge is dynamic + `.catch`-guarded, never run at build).
- **Discipline:** everything GENERAL (slug/PR-driven, no hardcoded component names). English only. `corepack pnpm`. `cd` the repo dir each shell call. The merge-panel UI (Task 3) uses **frontend-design**.
- **Ops delta:** the admin's `GITHUB_TOKEN` now needs **Pull requests: Write + Contents: Write** (to merge) — documented in Task 4, not a code change.
- **Out of scope:** batch/auto-merge, merge queue, UI merge-method choice, required-review/role checks beyond "signed in", deep Storybook embed.

## File Structure

```
apps/admin/lib/github.ts        MODIFY — getPullRequestMergeState + mergePullRequest + pure canMerge + summarizeChecks
apps/admin/app/actions.ts       MODIFY — mergeComponentPr (requireSession → re-check → merge)
apps/admin/app/review/[slug]/page.tsx   MODIFY — top-level auth() gate + merge panel
apps/admin/app/review/MergeButton.tsx   NEW (client) — confirm + busy/error + refresh
apps/admin/app/review/review.module.css MODIFY — merge-panel styles (frontend-design)
apps/admin/test/merge-gate.test.ts      NEW — canMerge + summarizeChecks fixtures
```

---

## Task 1: Merge-state + CI data + pure `canMerge` (`lib/github.ts`)

**Files:** branch + spec commit; MODIFY `apps/admin/lib/github.ts`; NEW `apps/admin/test/merge-gate.test.ts`.

**Interfaces:** Produces `summarizeChecks(runs)`, `canMerge(state)` (pure), `getPullRequestMergeState(number)`, `mergePullRequest(number, headSha)`.

- [ ] **Step 1: Branch + commit the spec**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git checkout master && git pull --ff-only
git checkout -b phase4b-ii-merge
git add docs/design-system-admin/phase4b-ii-merge.md
git commit -m "docs(phase4b-ii): merge-from-UI spec

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

- [ ] **Step 2: Write the failing test `apps/admin/test/merge-gate.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { canMerge, summarizeChecks } from "../lib/github";

test("summarizeChecks: all-pass, one-fail, in-progress", () => {
  assert.deepEqual(summarizeChecks([{ status: "completed", conclusion: "success" }, { status: "completed", conclusion: "skipped" }]), { green: true, summary: "2 passing" });
  assert.deepEqual(summarizeChecks([{ status: "completed", conclusion: "success" }, { status: "completed", conclusion: "failure", name: "visual" }]), { green: false, summary: "1 failing: visual" });
  assert.deepEqual(summarizeChecks([{ status: "in_progress", conclusion: null, name: "ci" }]), { green: false, summary: "1 running: ci" });
  assert.deepEqual(summarizeChecks([]), { green: false, summary: "no checks reported" });
});

test("canMerge: only ok when mergeable + no conflicts + ci green", () => {
  assert.equal(canMerge({ mergeable: true, conflicts: false, ciGreen: true }).ok, true);
  assert.equal(canMerge({ mergeable: true, conflicts: false, ciGreen: false }).ok, false);
  assert.equal(canMerge({ mergeable: true, conflicts: true, ciGreen: true }).ok, false);
  assert.equal(canMerge({ mergeable: null, conflicts: false, ciGreen: true }).ok, false); // still computing
});

test("canMerge: reason names the blocker", () => {
  assert.match(canMerge({ mergeable: true, conflicts: false, ciGreen: false }).reason, /CI/i);
  assert.match(canMerge({ mergeable: true, conflicts: true, ciGreen: true }).reason, /conflict/i);
  assert.match(canMerge({ mergeable: null, conflicts: false, ciGreen: true }).reason, /comput/i);
});
```

- [ ] **Step 3: RED**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsx --test test/merge-gate.test.ts
```
Expected: FAIL — `canMerge`/`summarizeChecks` not exported.

- [ ] **Step 4: Add the helpers to `apps/admin/lib/github.ts`** (append; reuse `getConfig`/`githubFetch`)

```ts
export interface CheckRun { status: string; conclusion: string | null; name?: string }

/** Reduce GitHub check-runs to a green flag + a short human summary. Green only
 *  when every run is completed with a non-failing conclusion and none is still
 *  running/queued. */
export function summarizeChecks(runs: CheckRun[]): { green: boolean; summary: string } {
  if (runs.length === 0) return { green: false, summary: "no checks reported" };
  const running = runs.filter((r) => r.status !== "completed");
  if (running.length) return { green: false, summary: `${running.length} running: ${running.map((r) => r.name ?? "?").join(", ")}` };
  const failing = runs.filter((r) => !["success", "neutral", "skipped"].includes(r.conclusion ?? ""));
  if (failing.length) return { green: false, summary: `${failing.length} failing: ${failing.map((r) => r.name ?? "?").join(", ")}` };
  return { green: true, summary: `${runs.length} passing` };
}

/** Pure merge decision: ok only when GitHub says mergeable, no conflicts, CI green. */
export function canMerge(state: { mergeable: boolean | null; conflicts: boolean; ciGreen: boolean }): { ok: boolean; reason: string } {
  if (state.conflicts) return { ok: false, reason: "PR has conflicts" };
  if (state.mergeable === null) return { ok: false, reason: "GitHub is still computing mergeability -- refresh in a moment" };
  if (!state.mergeable) return { ok: false, reason: "PR is not mergeable" };
  if (!state.ciGreen) return { ok: false, reason: "CI is not green" };
  return { ok: true, reason: "" };
}

export interface PrMergeState { mergeable: boolean | null; conflicts: boolean; headSha: string; ciGreen: boolean; ciSummary: string }

/** Fetch the PR's mergeability + CI status for the gate. */
export async function getPullRequestMergeState(number: number): Promise<PrMergeState> {
  const { repo } = getConfig();
  const prRes = await githubFetch(`/repos/${repo}/pulls/${number}`);
  if (!prRes.ok) throw new Error(`getPullRequestMergeState ${number}: ${prRes.status} ${await prRes.text()}`);
  const pr = (await prRes.json()) as { mergeable: boolean | null; mergeable_state: string; head: { sha: string } };
  const headSha = pr.head.sha;
  const checksRes = await githubFetch(`/repos/${repo}/commits/${headSha}/check-runs`);
  let ciGreen = false, ciSummary = "no checks reported";
  if (checksRes.ok) {
    const data = (await checksRes.json()) as { check_runs?: CheckRun[] };
    ({ green: ciGreen, summary: ciSummary } = summarizeChecks(data.check_runs ?? []));
  }
  return { mergeable: pr.mergeable, conflicts: pr.mergeable_state === "dirty", headSha, ciGreen, ciSummary };
}

/** Squash-merge the PR, guarded by the head SHA (GitHub rejects if it moved).
 *  Returns { merged:false, message } on a 405/409 rather than throwing at the UI. */
export async function mergePullRequest(number: number, headSha: string): Promise<{ merged: boolean; message?: string }> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/pulls/${number}/merge`, {
    method: "PUT",
    body: JSON.stringify({ merge_method: "squash", sha: headSha }),
  });
  if (res.ok) return { merged: true };
  const text = await res.text();
  if (res.status === 405 || res.status === 409) return { merged: false, message: `GitHub refused the merge (${res.status}): ${text.slice(0, 200)}` };
  throw new Error(`mergePullRequest ${number}: ${res.status} ${text}`);
}
```

- [ ] **Step 5: GREEN + typecheck**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsx --test test/merge-gate.test.ts
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsc --noEmit
```
Expected: 3/3 pass; `tsc --noEmit` exit 0. (If a `summarizeChecks` assertion's exact string differs, adjust the ASSERTION to the real output — don't weaken the helper.)

- [ ] **Step 6: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/lib/github.ts apps/admin/test/merge-gate.test.ts
git commit -m "feat(admin): PR merge-state + CI status + pure canMerge/mergePullRequest

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 2: The merge server action (`app/actions.ts`)

**Files:** MODIFY `apps/admin/app/actions.ts`.

**Interfaces:** Produces `mergeComponentPr(slug): Promise<{ merged: boolean; reason?: string }>`.

- [ ] **Step 1: Add `mergeComponentPr` (mirrors the `requireSession` pattern)**

Add imports: `getPullRequestForSlug`, `getPullRequestMergeState`, `canMerge`, `mergePullRequest` from `@/lib/github`. Then:
```ts
/** Merge a component's PR, gated on the session AND re-checked server-side
 *  (mergeable + CI green) immediately before merging -- never trusts the client
 *  button's enabled state. Squash; head-SHA guarded. */
export async function mergeComponentPr(slug: string): Promise<{ merged: boolean; reason?: string }> {
  await requireSession();
  const pr = await getPullRequestForSlug(slug);
  if (!pr) return { merged: false, reason: "no open PR for this component" };
  const state = await getPullRequestMergeState(pr.number);
  const gate = canMerge(state);
  if (!gate.ok) return { merged: false, reason: gate.reason };
  const res = await mergePullRequest(pr.number, state.headSha);
  return { merged: res.merged, reason: res.message };
}
```

- [ ] **Step 2: Typecheck + tests + build**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsc --noEmit
corepack pnpm --filter @d-2-g-8/design-system-admin test
AUTH_SECRET=test-only corepack pnpm -F @d-2-g-8/design-system-admin build
```
Expected: tsc clean; admin fixtures pass; build green. (`mergeComponentPr` is server-glue re-using the pure `canMerge` + the wrappers — no new unit test; covered by the build + the live smoke.)

- [ ] **Step 3: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/app/actions.ts
git commit -m "feat(admin): mergeComponentPr server action (session + server-side re-check, squash)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 3: Review-page auth gate + merge panel + `MergeButton`

**Files:** MODIFY `apps/admin/app/review/[slug]/page.tsx`; NEW `apps/admin/app/review/MergeButton.tsx`; MODIFY `apps/admin/app/review/review.module.css`.

**REQUIRED SUB-SKILL:** invoke **frontend-design** for the merge panel (a calm, clearly-gated action — the disabled state + reason must read as "not yet", not "broken").

- [ ] **Step 1: Add the in-code `auth()` gate at the top of the page**

In `page.tsx`, add imports `import { auth } from "@/auth"; import { redirect } from "next/navigation";` and, as the FIRST line inside `ReviewPage` (before `await params`):
```ts
  const session = await auth();
  if (!session?.user) redirect("/signin");
```
(The middleware already redirects, but this makes the page hosting the merge control gated in-code too — the 4b-i final-review follow-up.)

- [ ] **Step 2: `MergeButton.tsx` (client — confirm + busy/error + refresh)**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { mergeComponentPr } from "../actions";
import styles from "./review.module.css";

export function MergeButton({ slug, prNumber, disabled, reason }: { slug: string; prNumber: number; disabled: boolean; reason: string }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [merged, setMerged] = useState(false);
  const router = useRouter();

  if (merged) return <span className={styles.mergedOk}>Merged ✓</span>;

  if (!confirming) {
    return (
      <span className={styles.mergeWrap}>
        <button type="button" className={styles.mergeBtn} disabled={disabled} onClick={() => setConfirming(true)}>
          Merge #{prNumber}
        </button>
        {disabled && reason && <span className={styles.mergeReason}>{reason}</span>}
      </span>
    );
  }

  return (
    <span className={styles.mergeWrap}>
      <span>Merge #{prNumber} to master?</span>
      <button type="button" className={styles.mergeConfirm} disabled={busy} onClick={async () => {
        setBusy(true); setErr(null);
        try {
          const res = await mergeComponentPr(slug);
          if (res.merged) { setMerged(true); router.refresh(); }
          else setErr(res.reason ?? "merge failed");
        } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
        finally { setBusy(false); }
      }}>{busy ? "Merging…" : "Confirm merge"}</button>
      <button type="button" className={styles.mergeCancel} disabled={busy} onClick={() => setConfirming(false)}>Cancel</button>
      {err && <span role="alert" className={styles.mergeError}>{err}</span>}
    </span>
  );
}
```

- [ ] **Step 3: The merge panel in `page.tsx`** (after the findings + compare, only when there's a PR)

```tsx
// near the other server-side reads (pr is known non-null here):
const mergeState = await getPullRequestMergeState(pr.number).catch(() => null);
const gate = mergeState ? canMerge(mergeState) : { ok: false, reason: "could not read merge state" };
// ...in the JSX, a <section className={styles.mergePanel}>:
//   a status line: mergeState ? `Mergeable: ${mergeState.mergeable} · CI: ${mergeState.ciSummary}` : gate.reason
//   <MergeButton slug={slug} prNumber={pr.number} disabled={!gate.ok} reason={gate.reason} />
```
Add the imports `getPullRequestMergeState, canMerge` from `@/lib/github` and `MergeButton` from `./MergeButton`. frontend-design shapes `.mergePanel`/`.mergeBtn`/`.mergeReason`/etc. in `review.module.css`.

- [ ] **Step 4: Typecheck + build**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsc --noEmit
AUTH_SECRET=test-only corepack pnpm -F @d-2-g-8/design-system-admin build
```
Expected: tsc clean; build green; `/review/[slug]` stays `ƒ` dynamic and doesn't crash with no env (the `getPullRequestMergeState` call is `.catch`-guarded → `gate` falls back to a blocked state).

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/app/review/\[slug\]/page.tsx apps/admin/app/review/MergeButton.tsx apps/admin/app/review/review.module.css
git commit -m "feat(admin): merge panel on the review page (auth gate + gated MergeButton + confirm)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 4: Full verify + ops docs

**Files:** MODIFY `apps/admin/README.md` (+ the spec's ops section if not precise).

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
Expected: `-r typecheck` green; admin fixtures (merge-gate + auth-policy + github-review + design-state + run-correlation) pass; admin build green with `AUTH_SECRET`; library + codegen unaffected; lockfile v9.

- [ ] **Step 2: Generality + no cross-repo edits**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
! grep -rnE "slug\s*===\s*['\"]|['\"](button|chip|avatar)['\"]" apps/admin/lib apps/admin/app && echo "GENERAL"
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app && git status --porcelain
```
Expected: `GENERAL` (a `type="button"` hit is benign — inspect any hit); `ai-tools-app` empty.

- [ ] **Step 3: README ops delta** — update `apps/admin/README.md`: the `GITHUB_TOKEN` now needs **Pull requests: Write + Contents: Write** (to merge from the UI), one scope more than the 4b-i reads; note that a branch-protection rule on `master` must allow the token to merge (or the merge 405s with the reason surfaced in the UI). Document that merge is gated on mergeable + CI-green, re-checked server-side, squash.

- [ ] **Step 4: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/README.md docs/design-system-admin/phase4b-ii-merge.md
git commit -m "docs(phase4b-ii): merge ops (token write scopes, branch protection)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Self-Review notes (checked against the spec)

- **Coverage:** merge-state + CI + canMerge → Task 1; merge action → Task 2; auth gate + merge panel → Task 3; verify/docs → Task 4.
- **Merge gate:** pure `canMerge` (ok only when mergeable + no conflicts + CI green); the action re-fetches merge-state server-side and re-runs `canMerge` before merging (never trusts the button); confirm step in `MergeButton`; squash + head-SHA guard in `mergePullRequest`.
- **Authz:** `mergeComponentPr` calls `requireSession()` first; `/review/[slug]` gains a top-level `auth()` → `redirect("/signin")` (the 4b-i follow-up). Middleware still gates too.
- **Crash-safety/build:** the merge-state read is `.catch`-guarded (page falls back to a blocked gate); build green with throwaway `AUTH_SECRET`; dynamic route.
- **Generality:** slug/PR-driven, no hardcoded names. **Boundary:** no batch/auto-merge/queue/method-choice.
- **Type consistency:** `getPullRequestMergeState` → `PrMergeState`; `canMerge(state)` → `{ok, reason}`; `mergePullRequest(number, headSha)` → `{merged, message?}`; `mergeComponentPr(slug)` → `{merged, reason?}`.
- **Ops:** `GITHUB_TOKEN` gains PR+Contents write (Task 4 README) — the one deploy delta.
```
