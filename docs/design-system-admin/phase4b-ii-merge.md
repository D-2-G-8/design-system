# Phase 4b-ii — merge-from-UI

Add the one high-stakes **write** to the admin: an authenticated reviewer can
**merge** a component's PR from the review page — but only when GitHub reports it
**mergeable AND its CI is green**, re-checked **server-side** right before the
merge, behind a **confirm step**. Closes the in-app-review loop (generate →
review → merge) started in 4b-i.

Builds on Phase 4b-i (the GitHub-OAuth login + `/review/[slug]` read-only surface
+ `getPullRequestForSlug`) and 4a (server actions, `syncJob`). Source-of-truth
docs: `architecture.md`, `phase4a-admin-ui.md`, `phase4b-i-login-review.md`.

## Locked decisions (settled with the user)

1. **Merge gate:** the Merge button is enabled only when the PR is **mergeable
   (no conflicts) AND CI is green**; a **confirm step** precedes the merge; the
   server action **re-checks state server-side** immediately before merging
   (never trusts the button). CI-red or conflicted → merge blocked, reason shown.
2. **Authz:** the merge server action calls `requireSession()` **first** (in-code,
   belt-and-suspenders with the middleware — server actions are directly-POSTable);
   AND the `/review/[slug]` page gains an explicit `auth()` check at the top (the
   4b-i final-review follow-up), so the page hosting the merge control is gated
   in-code, not only by the matcher.
3. **Merge method = squash** (fixed; no UI choice). Head-**SHA** concurrency guard
   (GitHub rejects the merge if the branch moved since we checked).

## Architecture / data flow

```
/review/[slug]  (auth() at top → redirect to /signin if no session)
   findings + design↔screenshot (4b-i)  +  MERGE PANEL:
     server reads PR merge-state: { mergeable, conflicts, ciGreen, ciSummary, headSha }
     <MergeButton disabled={!canMerge(...)} reason=...>  (client)
        │ click → confirm "Merge #N to master?"
        ▼ mergeComponentPr(slug)  (server action)
          requireSession()  →  RE-FETCH merge-state server-side  →  canMerge? 
          →  mergePullRequest(number, headSha, squash)  →  { merged } | { error, reason }
```

Nothing auto-merges; a human clicks + confirms. CI (already green as the gate)
plus the server-side re-check are the safety net. The dashboard row flips to
`committed` on the next load (git = state).

## Part A — merge-state + CI data (`lib/github.ts`)

- `getPullRequestMergeState(number: number): Promise<{ mergeable: boolean | null; conflicts: boolean; headSha: string; ciGreen: boolean; ciSummary: string }>`:
  - `GET /repos/<repo>/pulls/<number>` → `mergeable` (bool|null — null = GitHub
    still computing → treat as not-yet), `mergeable_state` (`dirty` = conflicts),
    `head.sha`.
  - `GET /repos/<repo>/commits/<headSha>/check-runs` → `ciGreen` = every run's
    `conclusion ∈ {success, neutral, skipped}` AND none `in_progress/queued`;
    `ciSummary` = e.g. `"3 passing"` or `"1 failing: visual"`. (Combine with the
    legacy `GET /commits/<sha>/status` only if needed; check-runs covers our CI.)
- pure **`canMerge({ mergeable, conflicts, ciGreen }): { ok: boolean; reason: string }`**
  — `ok` only when `mergeable === true && !conflicts && ciGreen`; else a specific
  reason (`"CI not green"`, `"has conflicts"`, `"GitHub still computing mergeability"`).
  Unit-tested.
- `mergePullRequest(number: number, headSha: string): Promise<{ merged: boolean; message?: string }>`
  — `PUT /repos/<repo>/pulls/<number>/merge` body `{ merge_method: "squash", sha: headSha }`.
  A 405/409 (not mergeable / sha mismatch) → `{ merged: false, message }` (don't throw
  the raw error at the UI).

## Part B — the merge server action (`app/actions.ts`)

`mergeComponentPr(slug: string): Promise<{ merged: boolean; reason?: string }>`:
1. `await requireSession();` (in-code gate, first).
2. `const pr = await getPullRequestForSlug(slug)` → if none, `{ merged:false, reason:"no open PR" }`.
3. `const state = await getPullRequestMergeState(pr.number)` (server-side re-check).
4. `const gate = canMerge(state)` → if `!gate.ok`, `{ merged:false, reason:gate.reason }`.
5. `const res = await mergePullRequest(pr.number, state.headSha)` → `{ merged:res.merged, reason:res.message }`.

Never trusts client-passed mergeability; always re-derives from a fresh fetch.

## Part C — UI: merge panel on `/review/[slug]`

- Add `const session = await auth(); if (!session?.user) redirect("/signin")` (or
  render a denied state) at the TOP of the page (the flagged in-code gate).
- After the findings + compare, a **merge panel** (only when there's an open PR):
  - Server-side: `const state = await getPullRequestMergeState(pr.number).catch(() => null)`;
    `const gate = state ? canMerge(state) : { ok:false, reason:"could not read merge state" }`.
  - Status line: mergeable? + `ciSummary` + the reason when blocked.
  - `<MergeButton slug prNumber={pr.number} disabled={!gate.ok} reason={gate.reason} />`
    (client component): disabled + reason shown when `!gate.ok`; on click → an
    inline **confirm** ("Merge #N to master?") → calls `mergeComponentPr(slug)`;
    on success shows "Merged ✓" + the PR link; on failure shows `reason`.
- `MergeButton` (client) mirrors `GenerateButton`'s busy/error pattern + a
  two-step confirm; `router.refresh()` after a successful merge.
- Built with **frontend-design** (a calm, clearly-gated action — the disabled
  state and reason must read as "not yet", not "broken").

## Testing

- **`canMerge`** (pure): fixtures — green+mergeable → ok; CI red → blocked(reason);
  conflicts → blocked; `mergeable:null` → blocked("computing"). GitHub calls injected.
- **CI summary shaping** (pure helper over sample check-runs JSON): all-pass, one-fail,
  in-progress.
- `getPullRequestMergeState`/`mergePullRequest` — thin GitHub wrappers, covered by
  the build + the documented live smoke (module-scoped `githubFetch`, same as the
  other helpers).
- **`next build`** green with a throwaway `AUTH_SECRET`; the merge is dynamic +
  `.catch`-guarded, never exercised at build. `tsc` clean; admin fixtures pass.

## Ops delta (user)

- The admin's `GITHUB_TOKEN` now needs **Pull requests: Write + Contents: Write**
  (to merge) — one scope more than 4b-i (which needed only reads + dispatch).
  README updated. (Branch protection on `master`, if any, must allow the token to
  merge — or the merge 405s with a clear reason surfaced in the UI.)
- Everything else (OAuth login, deployment protection, `ADMIN_GITHUB_USERS`)
  unchanged.

## Out of scope (later)

- Batch-merge / auto-merge-on-green / a merge queue.
- Choosing the merge method in the UI (squash is fixed).
- Requiring an approving GitHub review or a specific org role beyond "signed in".
- Deep per-story Storybook embed (still deferred).

## Ordered outline (for the plan)

1. `lib/github.ts`: `getPullRequestMergeState` + `mergePullRequest` + pure
   `canMerge` (and the pure CI-summary helper) + fixtures.
2. `app/actions.ts`: `mergeComponentPr` (requireSession → re-check → merge).
3. `/review/[slug]`: top-level `auth()` gate + the merge panel + `MergeButton`
   (client, confirm + busy/error + refresh). frontend-design.
4. Verify (tsc + admin build w/ AUTH_SECRET + fixtures) + README ops delta.
