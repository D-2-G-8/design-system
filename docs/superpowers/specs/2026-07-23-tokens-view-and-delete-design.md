# Design: Tokens view + Delete deployed component (admin)

**Date:** 2026-07-23
**Status:** Approved (design), pending implementation plan
**Repo:** `design-system` monorepo — `apps/admin`, `packages/codegen`, `.github/workflows`

## Problem

Two gaps in the admin surfaced after the sync→generate flow went live:

1. **Tokens are invisible.** The dashboard lists components + icons + jobs, and
   `/review/sync` shows a token *diff*, but there is nowhere to *see* the tokens
   themselves. They live in `tokens/tokens.json` on master.
2. **A deployed (committed) component cannot be deleted.** The admin has
   Generate/Regenerate but no Delete — so a bad generation can't be removed
   without going to GitHub. (This is the deferred "reconcile-DELETE" item.)

## Decisions (settled in brainstorming)

- **Tokens = a read-only section on the dashboard** (not a separate page).
- **Delete removes the component fully from the repo**: its code dir, its manifest
  entry, and any barrel export line. (User chose full removal over "code only".)
  Note surfaced to the user: the component still exists in Figma, so the **next
  Sync re-adds it to the catalog as a `never` seed** — deletion is not permanent
  against Figma. This is acceptable and will be stated in the confirm UI.
- **Delete is delivered as a reviewable PR** (`delete/<slug> → master`), CI-verified,
  merged from the admin — same shape as generate/sync. Not an immediate master commit.
- **Both features ship in one plan.**

## Non-goals (YAGNI)

- Editing tokens in the UI (they come from the Figma sync).
- "Soft" delete (code only, keep manifest) — rejected; full removal chosen.
- Fixing the pre-existing "generate never adds a component to the root barrel"
  gap (see Grounding) — out of scope; delete handles the barrel defensively.

## Grounding (facts verified in the codebase)

- Root barrel `packages/components/src/index.ts` is an **explicit** list:
  `export { Button } from "./components/button";` + `export type { ButtonProps } ...`.
  **Nothing in `packages/codegen` or the admin adds to this barrel** — only the
  seeded Button line exists. So `delete` must remove any matching barrel line
  **if present** (defensive: a no-op for a generated component that was never
  barrelled, but prevents a broken build for one that was).
- `packages/codegen/src/loaders.ts` exports `loadManifest(root)`, `writeManifest(manifest, root)`,
  `MANIFEST_FILE`, `findRepoRoot()`. `paths.ts` exports `componentSourcePaths(slug, isIcon)`
  → `{ dir, ... }` (the `src/components/<slug>` or `src/icons/<slug>` dir).
- `tokens/tokens.json` is a flat `Record<string, { category: string; value: string }>`.
- Admin patterns to reuse: dashboard reads master via `lib/github.ts`
  (`getFileContent(path, ref?)`); `ComponentTable` renders committed/pending/never
  rows; `MergeButton` has a trigger→confirm→done pattern; merge machinery
  (`getPullRequestMergeState`, `canMerge`, `mergePullRequest`) is keyed by PR number;
  the worker+PAT pattern is `.github/workflows/sync.yml`; the job store is `lib/jobs.ts`.

---

## Design

### Feature A — Tokens section on the dashboard

**Pure diff/reader is trivial; this is mostly display.**

- `lib/tokens-view.ts` (NEW, pure): `groupTokensByCategory(tokens: Record<string, TokenEntry>): { category: string; tokens: { name: string; value: string }[] }[]`
  where `TokenEntry = { category: string; value: string }`. Sorted by category, then name.
  Unit-tested.
- `lib/design-state.ts` or the dashboard reads `tokens/tokens.json` from master via
  `getFileContent("tokens/tokens.json")` (`.catch`-guarded → `{}` on missing/parse fail).
- `app/components/TokensPanel.tsx` (NEW, server component): renders the grouped tokens
  as a dashboard section. For a token whose `category === "color"`, show a color swatch
  (`<span style={{ background: value }}>`) + name + hex value; for other categories, show
  name + value. A section heading with a total count, matching the `ComponentTable` /
  `JobsPanel` section style.
- `app/page.tsx`: fetch tokens (guarded) and render `<TokensPanel tokens={...} />` after
  the component table. Empty/missing tokens → a friendly "No tokens yet" empty state.

### Feature B — Delete a deployed component

Same pattern as generate/sync: **CLI writes files → worker commits + opens PR → admin
dispatches + merges.**

**1. `codegen delete <slug>` (CLI, `packages/codegen`)**
- New pure-ish function `deleteComponent(slug, root)` in `packages/codegen/src/delete.ts`:
  1. `loadManifest(root)`; find the entry (components or icons) by slug. If not found,
     throw a clear error (`slug not in manifest`).
  2. Remove the entry from its array; `writeManifest(...)`.
  3. `rmSync(componentSourcePaths(slug, entry.isIcon).dir, { recursive: true, force: true })`.
  4. Remove any barrel line in `packages/components/src/index.ts` that imports from
     `./components/<slug>` or `./icons/<slug>` (both the `export { X }` and
     `export type { XProps }` lines) — a no-op if none exist.
  5. Return the changed paths.
- Wire a `delete <slug>` subcommand into `packages/codegen/src/cli.ts`, mirroring `generate`.
- Unit tests (fixture repo dir): removes dir + manifest entry + a present barrel line;
  is a no-op on the barrel when the component isn't barrelled; errors on unknown slug.

**2. `.github/workflows/delete.yml` (worker)**
- Copy of `sync.yml`'s structure: `workflow_dispatch` with inputs `slug` + `jobId`,
  `permissions: contents/pull-requests write`, per-slug `concurrency`.
- Steps: checkout → setup pnpm/node → install → run `corepack pnpm --filter @d-2-g-8/codegen codegen delete "$SLUG"`
  (slug passed via `env:` and referenced as `"$SLUG"`, never interpolated into the run
  script — injection-safe, same rule the other workflows follow) → `create-pull-request`
  with `token: ${{ secrets.CREATE_PR_TOKEN }}`, `branch: delete/<slug>`, `base: master`,
  `title: "delete: <slug>"`, `add-paths: packages/components` + `design-system.manifest.json`.

**3. Admin wiring**
- `lib/github.ts`: `dispatchDelete(slug, jobId)` (dispatch `delete.yml`, mirrors
  `dispatchGenerate`); `getDeletePullRequest(slug)` → open PR with head `delete/<slug>`
  → `{ number, htmlUrl, headRef } | null` (mirrors `getPullRequestForSlug`); a
  `listOpenDeletePRs(): Promise<Map<slug, url>>` (head `delete/*`, mirrors `listOpenCodegenPRs`).
- `lib/design-state.ts`: `loadComponentState` also fetches `listOpenDeletePRs()` and sets a
  new optional `deletePrUrl?: string` on `ComponentState` for a slug with an open delete PR.
  `deriveComponentState` gains this as a passthrough (does not change the status enum).
- `app/actions.ts`:
  - `deleteComponent(slug): Promise<DispatchResult>` — `requireSession()`, `enqueue("delete", slug)`,
    `dispatchDelete(slug, job.id)`, returns `{ ok, jobId }` / `{ ok:false, error }` (same shape
    and try/catch discipline as `generateComponent`).
  - `mergeDeletePr(slug): Promise<{ merged: boolean; reason?: string }>` — `requireSession()`,
    `getDeletePullRequest(slug)`, `getPullRequestMergeState`, `canMerge`, `mergePullRequest`
    (mirrors `mergeComponentPr`; gate re-checked server-side; SHA-guarded).
- `app/components/DeleteButton.tsx` (NEW, client): on a committed row, a quiet secondary
  "Delete" button → inline confirm ("Delete <name>? Removes its code + catalog entry. The
  next Sync re-adds it as a seed.") → `deleteComponent(slug)` → `router.refresh()`. Reads
  the returned `{ok,error}` (never throws to the digest); errors shown inline. Mirrors the
  `SyncActions`/`MergeButton` client discipline (try/catch, `role="alert"`).
- Delete-pending state: when a row has `deletePrUrl`, show "Delete pending — PR ↗" plus a
  **"Merge delete"** button that calls `mergeDeletePr(slug)`. The button is always enabled;
  the server action re-checks `canMerge` and returns a `reason` if not ready (no per-row CI
  fetch on the dashboard — avoids N calls). On `merged`, `router.refresh()`.
- `SelectableComponents.tsx` renders `DeleteButton` in the action cell for committed rows
  (next to Regenerate), and the delete-pending controls when `deletePrUrl` is set.

## Data flow

```
Dashboard → getFileContent(tokens.json) → groupTokensByCategory → <TokensPanel>
Committed row → Delete → confirm → deleteComponent(slug) → delete.yml (PAT)
             → PR delete/<slug> (removes dir + manifest entry + barrel line) → CI
Dashboard → listOpenDeletePRs → row shows "Delete pending" + Merge delete
Merge delete → mergeDeletePr(slug) [gate: session + canMerge, SHA-guarded] → merge
Dashboard → loadComponentState → the slug is gone from the manifest → no row
           (until the next Sync re-adds it as a `never` seed)
```

## Error handling

- Tokens read `.catch`-guarded → empty state, never 500.
- `codegen delete` throws a clear error on an unknown/unlisted slug; the worker step fails,
  so no delete PR is opened on a bad slug.
- `deleteComponent`/`mergeDeletePr` return errors (no unhandled throw → no production digest);
  `mergeDeletePr` re-checks the gate server-side and returns a reason instead of merging when
  not ready.
- Barrel edit is defensive: removing a non-existent line is a no-op, never an error.

## Testing

- Pure units (committed, node:test via tsx):
  - admin `groupTokensByCategory` (grouping + sort + color vs non-color).
  - codegen `deleteComponent` against a fixture repo dir: dir removed, manifest entry gone,
    barrel line removed when present, no-op barrel when absent, throws on unknown slug.
- Build/typecheck gates: `apps/admin` tsc + build; `packages/codegen` typecheck + fixtures;
  library build stays green.
- Manual E2E (user-gated): dashboard shows a Tokens section with swatches; Delete a
  regenerated component → delete PR opens → CI green → Merge delete from admin → the row
  disappears from the dashboard.

## Open follow-ups (not this plan)

- The pre-existing "generate does not add a component to the root barrel" gap (generated
  components other than Button aren't in the published API). Worth a separate fix.
- Batch delete (multi-select) — single-component delete only for now.
