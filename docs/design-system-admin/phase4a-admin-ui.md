# Phase 4a — admin UI (lean dashboard)

Turn the `apps/admin` skeleton into a usable dashboard: list every component
with its **status derived from git** (committed on master / pending open-PR /
never), **generate/regenerate** buttons, **live job progress**, and links out to
each component's **PR** and **Storybook**. Reuses the APIs + plumbing Phase 1/3a
already built. In-app validation review + merge-from-UI + a bespoke login are
**Phase 4b**.

Builds on Phase 1 (`apps/admin` skeleton: `lib/jobs` Postgres store, `lib/github`
dispatch/poll, bearer `lib/auth`, routes) and Phase 3a (`lib/run-correlation`,
the job↔run sync). Source-of-truth docs: `architecture.md`, `phase3a-worker-loop.md`.

## Locked decisions (settled with the user)

1. **Scope:** lean 4a = dashboard (list + status) + generate/regenerate + live
   job progress + PR/Storybook links. Review-via-PR-link (findings already live
   in the PR body from 3a/3b). In-app review + merge = 4b.
2. **Auth:** rely on **Vercel deployment protection** to gate humans to the whole
   app; the UI reads state in **server components** and acts via **server
   actions** — all privileged GitHub/DB/dispatch calls run server-side, the
   browser never holds a token. The existing bearer-gated `/api/*` routes stay
   for programmatic callers. A bespoke GitHub-OAuth login is 4b.
3. **State = git.** Component status is derived from the GitHub API (the admin is
   serverless — no checkout): manifest inventory + committed dirs on master +
   open `codegen/<slug>` PRs.
4. **Storybook links (4a):** link to the deployed stand root (env) and/or the PR.
   Deep per-story links are a 4b polish (avoids coupling the admin to codegen's
   build).

## Architecture / data flow

```
Browser  (gated at the Vercel edge by deployment protection; no token in the browser)
   │
   ▼  apps/admin (Next.js on Vercel)
   • Server Components (request-time, dynamic):
       loadComponentState()  →  GitHub API: manifest + committed dirs + open PRs → per-component status
       listJobs()            →  Postgres (lib/jobs) → recent jobs
   • Server Actions:
       generateComponent(slug) → enqueue + dispatchGenerate       (existing lib)
       getJobStatus(jobId)     → syncJob (resolve+correlate run)   (shared with the /api route)
   • Existing bearer-gated /api/{generate,jobs,jobs/[id]} routes stay for programmatic callers
```

Nothing auto-merges; the admin surfaces state + triggers work. The worker + CI +
the human reviewer (on the PR) remain the pipeline.

## Part A — component-state reader (`apps/admin/lib`)

**`lib/github.ts`** gains three read helpers (reusing `getConfig`/`githubFetch`):
- `getFileContent(path: string, ref = "master"): Promise<string | null>` — contents
  API, base64-decoded; `null` on 404.
- `listDirEntries(path: string, ref = "master"): Promise<string[]>` — contents API
  over a directory → entry names; `[]` on 404 (dir not created yet).
- `listOpenCodegenPRs(): Promise<Map<string, string>>` — `GET /pulls?state=open` →
  `Map<headBranch, html_url>` filtered to `codegen/*` branches.

**`lib/design-state.ts`** (NEW):
- pure `deriveComponentState(manifest, committedComponents: string[], committedIcons: string[], prsByBranch: Map<string,string>): ComponentState[]` where
  `interface ComponentState { slug: string; name: string; isIcon: boolean; status: 'committed'|'pending'|'never'; prUrl?: string }`.
  For each `[...manifest.components, ...manifest.icons]`: committed if its slug is
  in the matching committed-dir list; else pending (with `prUrl`) if
  `prsByBranch` has `codegen/<slug>`; else never.
- `loadComponentState(): Promise<ComponentState[]>` — reads the manifest
  (`getFileContent("design-system.manifest.json")` → JSON), the two committed-dir
  listings (`listDirEntries("packages/components/src/components"|".../icons")`),
  and `listOpenCodegenPRs()`, then `deriveComponentState(...)`. Throws an
  actionable error if GitHub isn't configured (the page catches it — see Part C).

The pure `deriveComponentState` is unit-tested; the GitHub fetches are the thin
wrappers above (injected into `loadComponentState` for a fixture, or exercised
live only in the user-gated smoke).

## Part B — server actions + a shared job-sync (`apps/admin`)

- Extract the job↔run resolve+sync from the `GET /api/jobs/[id]` route into a
  shared **`lib/jobs-sync.ts`** `syncJob(id): Promise<{ job: Job | undefined; run: unknown }>`
  (the exact logic Phase 3a put in the route: if no `workflow_run_id`,
  `findRunByJobId`; persist; `getWorkflowRun`; `mapRunToJobStatus` → `setStatus`;
  return the fresh job). **Refactor the route to call `syncJob`** (DRY, no behavior
  change).
- **`app/actions.ts`** (`"use server"`):
  - `generateComponent(slug: string): Promise<{ jobId: string }>` — validate slug,
    `enqueue("generate", slug)`, `dispatchGenerate(slug, job.id)` (on dispatch
    failure `setStatus(failed)` + rethrow), return `{ jobId }`.
  - `getJobStatus(jobId: string): Promise<{ job: Job | undefined; run: unknown }>` —
    `syncJob(jobId)`. Lets the client poll live status without a bearer token.
- The existing `/api/generate` + `/api/jobs/[id]` bearer routes are unchanged
  (programmatic callers), just refactored to share `syncJob`.

## Part C — the dashboard UI (`apps/admin/app`)

Replace the static `app/page.tsx` with a real dashboard (server component,
`export const dynamic = "force-dynamic"` so `next build` doesn't render it):
- `const state = await loadComponentState().catch(() => null)` — on null (GitHub
  not configured), render a friendly "configure GITHUB_TOKEN + repo" panel instead
  of crashing.
- `const jobs = await listJobs()`.
- **`ComponentTable`** (server) — rows: name, kind, a **status badge**
  (committed=green / pending=amber / never=grey), and actions:
  - **Generate** (never) / **Regenerate** (committed/pending) — a client component
    button that calls the `generateComponent` server action, then reflects the
    returned jobId in the jobs panel (optimistic "queued").
  - **PR** link (pending → `prUrl`).
  - **Storybook** link (committed → the stand root from
    `DESIGN_SYSTEM_STORYBOOK_URL`, if set; else hidden).
- **`JobsPanel`** (client) — the recent jobs, each polling `getJobStatus(jobId)`
  on an interval (server action; stops polling on a terminal `done`/`failed`),
  showing queued→running→done/failed + a link to the run (`run.html_url`).

Build the UI with the **frontend-design** skill — a calm, legible internal-tool
look (clear status badges, a quiet table, one obvious primary action per row),
not raw inline styles. Keep it a single dashboard page for 4a.

## Testing

- **`deriveComponentState`** (pure): fixtures — committed (dir present), pending
  (open `codegen/<slug>` PR → prUrl), never (neither); icons vs components use the
  right dir list; a manifest entry with both a dir AND a PR resolves as committed.
- **`lib/github` read helpers**: light — a fixture over `getFileContent`/`listDirEntries`
  parsing (base64 decode, 404→null/[]) with an injected `githubFetch`, OR covered
  via `loadComponentState` with injected fetches.
- **admin `next build`** stays green with NO env (dynamic page + lazy env +
  `.catch` fallback). `tsc --noEmit` clean.
- Live E2E (a real dashboard load + a generate dispatch) is user-gated (needs
  `GITHUB_TOKEN` + the deployed app) — documented, not in CI.

## Preconditions (ops — user)

- **Vercel deployment protection ON** for the admin project — this is the human
  gate in 4a (the app has no bespoke login yet).
- `GITHUB_TOKEN` with **repo contents read + pull-requests read** (the existing
  dispatch token already has repo scope) + `GITHUB_DESIGN_SYSTEM_REPO` (Phase 1).
- Postgres attached (Phase 1). Optional `DESIGN_SYSTEM_STORYBOOK_URL` (the master
  Storybook stand) for the Storybook links.

### Live smoke (user-gated)
Deploy apps/admin to Vercel with deployment protection ON, GITHUB_TOKEN (repo
contents + PR read) + GITHUB_DESIGN_SYSTEM_REPO, Postgres attached, and optionally
DESIGN_SYSTEM_STORYBOOK_URL. Open the dashboard: it lists every manifest component
with committed/pending/never status; "Generate"/"Regenerate" dispatches the
workflow (visible in the jobs panel as queued→running→done, with a run link); a
pending component links to its open PR.

## Out of scope (Phase 4b+)

- In-app **validation review**: render the vision findings + pixel-diff baseline
  images + an embedded Storybook iframe side-by-side (4a links to the PR instead).
- **Approve / merge** the PR from the UI.
- **Deep per-story** Storybook links (needs the codegen story-id helper — 4a links
  to the stand root).
- A bespoke **GitHub-OAuth login** (4a relies on Vercel deployment protection).
- Batch/closure generate, filtering/search, pagination.

## Ordered outline (for the plan)

1. `lib/github.ts` read helpers (`getFileContent`/`listDirEntries`/`listOpenCodegenPRs`)
   + `lib/design-state.ts` (`deriveComponentState` pure + `loadComponentState`) + fixtures.
2. `lib/jobs-sync.ts` `syncJob` (extracted from the route; route refactored to use it)
   + `app/actions.ts` (`generateComponent`, `getJobStatus`).
3. Dashboard UI: `page.tsx` (server, dynamic, `.catch` fallback) + `ComponentTable`
   + status badges + generate/regenerate client buttons + PR/Storybook links +
   `JobsPanel` (client polling `getJobStatus`). Use **frontend-design**.
4. Verify: admin `tsc` + `next build` (no env) green + the pure fixtures pass;
   doc + ops note.
