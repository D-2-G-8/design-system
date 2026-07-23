# Design: Work with the Figma sync PR from the admin

**Date:** 2026-07-23
**Status:** Approved (design), pending implementation plan
**Repo:** `design-system` (monorepo) — `apps/admin` + `.github/workflows`

## Problem

The whole-library Figma metadata sync (`codegen sync`, dispatched by the admin's
"Sync from Figma" button → `sync.yml`) opens a PR `sync/figma → master` that
updates `design-system.manifest.json`, `tokens/tokens.json`, and a seed
`<slug>.contract.json` for every curated component/icon. Concretely, the current
run produced **30 components + 294 icons + tokens** in PR #17.

Two problems make this unusable from the admin today:

1. **The sync result has no home in the admin.** It appears only as a job row.
   The catalog only reaches the dashboard by merging the PR **on GitHub** — which
   defeats the purpose of hosting an admin instead of a CLI.

2. **Status derivation breaks on merge.** `deriveComponentState` (`apps/admin/lib/design-state.ts`)
   marks a component "committed" if **its directory exists** on master. But the
   sync now seeds a `contract.json` into a directory for *every* component/icon,
   so after merging the sync PR all 324 would show as "committed/shipped" even
   though only `button` has real code — hiding exactly the work the dashboard
   exists to show.

## Goals

The full path runs inside the admin, no GitHub visits:

```
Sync from Figma → review the catalog → accept into master → pick & generate components
```

## Non-goals (YAGNI)

- In-admin exclusion/curation of catalog entries. Decision: Figma is the source of
  truth; a wrong/missing entry is fixed via the 🟢 marker in Figma + Resync.
- Auto-merge of the sync PR.
- Retrieval-based ("describe a screen") generation.
- Editing tokens in the UI.

## Decisions (settled in brainstorming)

- **Sync becomes a review screen in the admin** (not auto-land, not read-from-branch).
- **Catalog control = view diff + accept/reject whole** (no in-admin exclusion).
- **Generation = per-row + multi-select batch** ("generate a specific one, not all").
- **Review surface = a dedicated screen** `/review/sync` (mirrors `/review/[slug]`),
  discovered via a dashboard banner.
- **Accept is gated on CI-green + mergeable** (same gate as component merges).

---

## Design

### Part 1 — Fix status derivation (prerequisite)

**What:** "committed" must mean *the component has real generated code*, not *its
directory exists*.

**How:**
- Add `listTree(ref)` to `apps/admin/lib/github.ts` using the Git Trees API
  (`GET /repos/{repo}/git/trees/{ref}?recursive=1`) — one call returns the whole
  tree. Fail-safe: if the API reports `truncated`, fall back to the current
  per-directory listing (or surface an explicit error) rather than silently
  under-reporting committed state.
- In `apps/admin/lib/design-state.ts`, derive committed slugs from the tree: a slug
  under `packages/components/src/components/<slug>/` (or `.../src/icons/<slug>/`)
  is **committed** iff its directory contains a real code file — a path ending in
  `.tsx` or a file named `index.ts`. A directory containing only
  `<slug>.contract.json` is **not** committed.
- `deriveComponentState` keeps its current signature (pure; still takes committed
  component/icon slug lists) — only the *source* of those lists changes. Its unit
  test stays valid.

**Result post-merge:** `button` = committed; the other 29 components + 294 icons =
`never` (i.e. "press Generate"). Also cheaper: one tree call replaces two dir
listings.

### Part 2 — Sync review screen (`/review/sync`)

**Discovery.** When an open `sync/figma → master` PR exists, the dashboard shows a
banner/card: **"New Figma sync ready to review → Review sync"**. Implemented with a
new `getSyncPullRequest()` in `github.ts` (finds the open PR whose head ref is
`sync/figma`). No open sync PR → no banner.

**Screen** (`apps/admin/app/review/sync/page.tsx`, `force-dynamic`, session-gated,
each fetch `.catch`-guarded like `/review/[slug]`):

- **Catalog diff** — read manifest + `tokens/tokens.json` from **both** `master`
  and the `sync/figma` branch (via `getFileContent(path, ref)`), compute a pure diff:
  - **Components:** added / removed / renamed (matched by slug; a name change on the
    same slug = renamed).
  - **Icons:** added / removed — counts plus a collapsible name list (there are ~294).
  - **Tokens:** added / removed / changed (compare `tokens.json` key→value maps).
  - The diff functions are **pure** (manifest-in / tokens-in → diff-out) and unit-
    tested with fixtures, living in a new `apps/admin/lib/sync-diff.ts`.
- **CI status** for the PR (reuse `getPullRequestMergeState`).
- **Accept** button — merges `sync/figma` into master via the existing
  `mergePullRequest(number, headSha)`, gated by `canMerge(state)` (mergeable +
  CI-green), re-checked server-side in a new `acceptSyncPr()` server action
  (mirrors `mergeComponentPr`: never trusts the client's enabled state).
- **Close** button (optional) — closes the PR (PATCH state=closed) without merging;
  a fresh Resync re-opens/updates the same branch.
- Inline hint: *"Something wrong, or missing? Fix the 🟢 marker in Figma and Resync."*

### Part 3 — Catalog visible + selective generation

- After Accept, master's manifest updates → the dashboard shows all 30 + 294 with
  **correct** statuses (Part 1).
- **Per-row Generate** already exists (`GenerateButton` → `generateComponent(slug)`).
- **Multi-select batch:** checkboxes on rows (at least `never` rows; `committed`
  rows offer "regenerate"), plus a sticky action bar **"Generate selected (N)"** that
  dispatches each selected slug through the existing `generateComponent(slug)` action
  with bounded client-side concurrency; jobs appear in the Jobs panel (which now
  auto-refreshes). A **"Select all visible"** control covers "generate all icons".
- No new server action needed for the batch — it is client-side orchestration over
  the existing per-slug action.

## Reuse vs. new

**Reuse:** `/review/[slug]` screen shape + `review.module.css`; `mergePullRequest` /
`canMerge` / `getPullRequestMergeState`; `generateComponent`; the Jobs panel;
`sync.yml` (already fixed to use a PAT so its PR triggers CI).

**New:**
- `github.ts`: `listTree(ref)`, `getSyncPullRequest()`.
- `design-state.ts`: tree-based committed derivation.
- `sync-diff.ts`: pure catalog + token diff (unit-tested).
- `actions.ts`: `acceptSyncPr()` (gated), optionally `closeSyncPr()`.
- `app/review/sync/page.tsx` + a small client accept/close control.
- Dashboard: sync banner; `ComponentTable` multi-select + batch bar.

## Data flow

```
SyncButton → syncFromFigma() → sync.yml (PAT) → PR sync/figma  (metadata)
Dashboard  → getSyncPullRequest() → banner "Review sync"
/review/sync → diff(master, sync/figma) + CI status
            → Accept → acceptSyncPr() [gate: mergeable + CI green] → merge to master
Dashboard  → loadComponentState() [tree-based] → 30 + 294 with real statuses
ComponentTable → select N → generateComponent(slug)×N → PRs codegen/<slug>
/review/<slug> → per-component review + merge (existing)
```

## Error handling

- Every network read on `/review/sync` is `.catch`-guarded and degrades to a
  fallback panel, never 500s (same discipline as `/review/[slug]`).
- `acceptSyncPr()` re-checks the gate server-side immediately before merging; a
  moved head SHA, lost CI-green, or conflict returns a reason instead of merging.
- `listTree` truncation is handled explicitly (fallback / error), never silent.
- Batch generate: a single slug's dispatch failure is surfaced per-row and does not
  abort the rest of the batch.

## Testing

- Pure units (node:test / tsx, committed under `apps/admin/test/`): `sync-diff`
  (added/removed/renamed/changed across components, icons, tokens); tree-based
  committed derivation (contract-only dir = never; real-code dir = committed);
  `deriveComponentState` unchanged.
- Manual E2E (user-gated): open `/review/sync` against PR #17, verify the diff shows
  ~30 components + 294 icons + tokens added, Accept merges, dashboard then shows
  correct statuses, multi-select generates the chosen components.

## Open follow-ups (not this plan)

- Partial/streaming progress for very large batches.
- Change-detection: a Figma-changed but already-committed component should reset to
  "needs regen" on resync (currently only manual regenerate).
