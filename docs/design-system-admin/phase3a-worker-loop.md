# Phase 3a — worker loop (code contour)

Make the GitHub Actions worker real: dispatch → run `codegen generate` for the
component with an **in-process validation loop** (real `tsc` + deterministic
gates + `holisticFix`-until-green) → open/update a per-component PR → let the
admin correlate the job to the run. This is the **code contour** only; the
**visual contour** (Playwright screenshot + vision-diff vs Figma + pixel
baselines) is Phase 3b.

Builds on Phase 2 (`packages/codegen`, the file-based single-token CLI —
merged to master, PR #8) and Phase 1 (the admin skeleton `apps/admin` + the
`generate.yml` worker skeleton + the job store). Source-of-truth docs:
`architecture.md`, `conventions.md`, `phase2-port-core.md` (all in this dir).

## Locked decisions (settled with the user)

1. **Scope:** Phase 3a = code contour. Playwright/vision/pixel = Phase 3b.
2. **In-process gate:** real `tsc --noEmit` over `packages/components` + the
   deterministic gates (A1–A7c) → `holisticFix` until green. The full
   `build-storybook` (vite) compile is NOT in the worker — it stays on the PR's
   CI (`ci.yml` already runs it; a human reviews CI before merge).
3. **Fix loop:** cap **3 rounds**. If still red, commit the best attempt and
   **open the PR anyway**, labeled `needs-human`, with the residual findings in
   the PR body.
4. **Job↔run correlation:** `generate.yml` sets
   `run-name: generate <slug> (job <jobId>)`; the admin lists `generate.yml`
   runs, matches the `jobId` in the run name to get the run id, then polls its
   status. No callback endpoint, no shared secret.
5. **Branch/PR:** one branch + PR **per component** — `codegen/<slug>` — opened
   or updated in place (peter-evans/create-pull-request), independent per slug.

## Architecture / data flow

```
Admin  ─POST /api/generate─▶ enqueue job(slug) ─▶ dispatchGenerate(slug, jobId)
                                                        │ workflow_dispatch (generate.yml)
                                                        ▼
   generate.yml   run-name: "generate <slug> (job <jobId>)"
     checkout → pnpm install → codegen generate <slug>        (the in-process loop)
                                     │ writes validated files under packages/components
                                     │ writes codegen-result.json  { slug, passed, rounds, findings[] }
                                     ▼
     peter-evans/create-pull-request → branch codegen/<slug>, PR
        (labels: needs-human when passed=false; findings in the body)
                                     │
   Admin  ◀─GET /api/jobs/[id]─ findRunByJobId(jobId) → run id → getWorkflowRun → map to job status
```

Component state = git (the PR). The job DB is bookkeeping only. **Nothing
auto-merges**: CI re-validates the PR and a human merges.

## Part A — CLI: the in-process validation loop (`packages/codegen`)

Phase 2's `codegen generate <slug>` writes files but runs no real compiler.
Phase 3a extends it (icons stay deterministic, see below). The loop, for a
regular (non-icon) component:

1. **Generate** via the ported `generateComponentCodeReviewed(model, component,
   tokens, childContracts)` (already does in-memory deterministic gates + LLM
   review + `holisticFix`) → gives `{ ...files, contract, reviewFindings,
   reviewPassed }`.
2. **Write** the files + contract via `writeComponent(...)` (Phase 2 loader).
3. **Real `tsc --noEmit`** over `packages/components` (spawn
   `corepack pnpm -F @d-2-g-8/design-system typecheck`), capture stdout/stderr.
4. **Map** tsc output → findings scoped to THIS component (new `tsc-runner.ts`):
   parse `path(line,col): error TSxxxx: message`, keep only errors whose path is
   under the component's dir (`src/{components|icons}/<slug>/`). Pre-existing
   errors in sibling components are ignored by this run (CI catches the whole
   library). Also run the deterministic gates over the written files via a new
   `gateComponent(files, { componentName, fileBase, contract, tokens, uses,
   childContracts, isIcon })` helper: it assembles the `ReviewContext`
   (`buildOwnProps`/`buildComposedProps`/`buildExpectedComposedImports` +
   `toCssVarName` — the same pieces `generateComponentCodeReviewed` uses, all
   already exported from Phase 2) and returns `runDeterministicGates(files, ctx)`.
   Re-gating each round catches a `holisticFix` that reintroduced a gate
   violation; round-0 gates already ran inside `generateComponentCodeReviewed`.
5. If there are findings, call the ported
   **`fixComponentFiles(model, component, contract, files, findings, childContracts?, tokens?)`**
   → rewrite the files → re-`tsc`. **Cap 3 rounds.**
6. Write **`codegen-result.json`** (repo root, gitignored) =
   `{ slug: string; isIcon: boolean; passed: boolean; rounds: number;
   findings: { file: string; message: string }[]; model: string }`. `passed` =
   no in-component tsc errors AND no build-breaking deterministic findings.
7. Exit **0** whether `passed` is true or false (the worker still opens the PR —
   the label carries needs-human). Exit **non-zero only on a hard error**
   (Figma/Anthropic unreachable, unexpected throw) so the workflow's PR step is
   skipped and the run concludes `failure`.

**Icons:** deterministic — `fetchIconSvg` → `buildIconComponentFiles` →
`writeComponent` → real `tsc` (scoped) once. No `holisticFix` (no LLM for
icons). A tsc error on an icon is a rare SVG-transform bug → `passed=false` +
`needs-human`, no fix rounds.

### New modules
- `packages/codegen/src/tsc-runner.ts` — `runPackageTypecheck(repoRoot): Promise<{ ok: boolean; raw: string }>` (spawn the workspace typecheck) + pure `parseTscOutput(raw): { file: string; line: number; message: string }[]` + `findingsForComponent(parsed, slug, isIcon): { file: string; message: string }[]` (scope by path). Pure parse/scope funcs are unit-tested; the spawn is injected so the loop is testable with a fake runner.
- `packages/codegen/src/validate.ts` — `gateComponent(files, ctxInput)` (assembles the `ReviewContext` + returns `runDeterministicGates`), and `runValidationLoop({ model, component, contract, files, tokens, childContracts, isIcon, typecheck, maxRounds=3 }): Promise<ValidationResult>` where `typecheck` is the injected runner. Returns `{ passed, rounds, findings, files }`. `cli.ts` `generate` calls: generate → write → `runValidationLoop` (real runner) → write final files → write `codegen-result.json`.

### CLI surface
- Extend the existing `codegen generate <slug> [--icon]`: it now runs the loop and writes `codegen-result.json`. Add `--max-rounds <n>` (default 3) and `--result-file <path>` (default `<repoRoot>/codegen-result.json`). `doctor`/`--help` unchanged (still no-env).
- `.gitignore`: add `codegen-result.json`.

## Part B — the `generate.yml` workflow

Replace the placeholder step. Shape:

```yaml
run-name: generate ${{ inputs.slug }} (job ${{ inputs.jobId }})
permissions:
  contents: write
  pull-requests: write
concurrency:
  group: generate-${{ inputs.slug }}     # already present
jobs:
  generate:
    steps:
      - checkout (fetch-depth: 0)
      - setup pnpm + node 22 (cache pnpm)
      - pnpm install --frozen-lockfile
      - name: Generate + validate
        env:
          SLUG: ${{ inputs.slug }}
          FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          # FIGMA_FILE_KEY optional; else the manifest's figmaFileKey is used
        run: corepack pnpm --filter @d-2-g-8/codegen codegen generate "$SLUG"
      - name: Read result
        id: result
        run: |            # jq over codegen-result.json → GITHUB_OUTPUT:
          #   passed=<bool>, body=<summary + round count + findings when !passed>
      - name: Open/update PR
        uses: peter-evans/create-pull-request@v6
        with:
          branch: codegen/${{ inputs.slug }}
          base: master
          title: "codegen: ${{ inputs.slug }}"
          body: <summary + findings from result>
          labels: ${{ steps.result.outputs.passed == 'true' && '' || 'needs-human' }}
          add-paths: packages/components
```

Notes: slug is passed via **env** (not interpolated into the shell), consistent
with the skeleton's injection-safety comment. `add-paths: packages/components`
keeps `codegen-result.json` (gitignored anyway) and any stray files out of the
commit. The PR body includes the round count and, when `passed=false`, the
residual findings. peter-evans opens the PR on first run and force-updates the
same branch/PR on re-runs. The run concludes `success` whenever generation
finished (PR opened, clean or needs-human) and `failure` only when the generate
step itself errored (hard failure — no PR).

## Part C — admin job↔run correlation (`apps/admin`)

- `apps/admin/lib/github.ts`: add
  `findRunByJobId(jobId: string): Promise<WorkflowRun | null>` — GET
  `/repos/{repo}/actions/workflows/generate.yml/runs?per_page=50`, return the run
  whose `name` (the `run-name`) contains `(job <jobId>)`, else `null` (the run may
  not exist yet right after dispatch). `getWorkflowRun` already exists.
- `apps/admin/app/api/jobs/[id]` GET route (Phase-1 skeleton has the jobs routes):
  on read, if the job's `workflow_run_id` is null, call `findRunByJobId`; if
  found, `setStatus(..., { workflow_run_id })`. Then `getWorkflowRun(runId)` and
  map: run not `completed` → `running`; `completed`+`success` → `done`;
  `completed`+`failure`/`cancelled`/`timed_out` → `failed`. Persist + return the
  job (with the run's `html_url` so the UI can link the run/PR).
- The **needs-human** nuance is the **PR label**, not a job status. The run
  conclusion stays `success` when a PR opened. Surfacing needs-human in the admin
  UI (read the PR label) is **Phase 4**. (This is the one softening of the
  "done-with-findings" ask — findings are fully captured on the PR; the job shows
  `done`. Revisit if a distinct job status is wanted.)
- No new `JobStatus` value; no callback route; no new secret (the admin already
  has `GITHUB_TOKEN` + `GITHUB_DESIGN_SYSTEM_REPO`).

## Testing

- **`tsc-runner.ts`** (pure): fixtures for `parseTscOutput` (a sample multi-error
  tsc dump) and `findingsForComponent` (scopes to `<slug>` dir, drops siblings).
- **`validate.ts`** (`runValidationLoop`): committed `node:test` fixtures with a
  **fake typecheck runner** — (a) clean first pass → `passed`, 0 fix rounds;
  (b) red→fix→green within cap; (c) still-red after 3 rounds → `passed=false` +
  findings; (d) icon path → tsc-only, no fix call. The generate/fix functions are
  stubbed/injected so no network/LLM/Figma is hit.
- **admin `findRunByJobId`** + status mapping: unit test over sample runs-list
  JSON (matches the jobId in `run-name`; returns null when absent; maps
  status/conclusion → job status).
- **Workflow YAML**: static-check with `actionlint` if available; otherwise a
  careful diff review. A real dispatch is the live smoke (below).
- **Live E2E is user-gated** (costs Figma + Anthropic) and requires the
  preconditions below — documented, not run in CI.

## Preconditions for a live run (ops — user)

- Repo **Actions secrets**: `FIGMA_ACCESS_TOKEN` (a `figd_` PAT with
  `library_content` read) and `ANTHROPIC_API_KEY`.
- Workflow **permissions** `contents: write` + `pull-requests: write` (in the
  workflow, above) AND the repo/org setting "Allow GitHub Actions to create pull
  requests" enabled.
- A **manifest component with real `figmaNodeIds`** — the seed `Button` has
  `figmaNodeIds: []`, so `fetchComponentDesignSpec` returns null and generation is
  label-only. A meaningful smoke needs a component whose node ids point at the DS
  Figma file (`figmaFileKey` already seeded).
- The admin deployed (Phase-1 op) if driving via the UI; otherwise dispatch
  `generate.yml` directly from the Actions tab for the CLI/workflow smoke.

## Out of scope (later phases)

- **Phase 3b (visual contour):** Playwright screenshot of the Default story →
  vision-diff vs the Figma render (the ported `visual-diff.ts`) + pixel-diff vs a
  committed baseline → visual findings fed into the same fix loop; re-add the
  Chromium install to `generate.yml`.
- **Batch / dependency-closure** generation in one dispatch (3a is single-slug —
  the dispatch is already per-slug).
- **Fine-grained live progress** (distilling/generating/fixing) — would need the
  callback approach we declined; run-name correlation gives coarse status.
- **Admin UI** dashboard/review (Phase 4), **publish** pipeline verify (Phase 5),
  **cutover** from ai-tools-app (Phase 6).

## Ordered outline (for the plan)

1. `tsc-runner.ts` — pure `parseTscOutput` + `findingsForComponent` + the spawn
   runner; fixtures. (No CLI wiring yet.)
2. `validate.ts` — `runValidationLoop` (injected typecheck + generate/fix); the
   4 fixture cases with a fake runner.
3. Wire `cli.ts generate` → generate → write → `runValidationLoop` (real runner)
   → write final files + `codegen-result.json`; `--max-rounds`/`--result-file`;
   gitignore `codegen-result.json`. Icon path = tsc-only.
4. `generate.yml` — run-name, permissions, install, `codegen generate`, read
   result, peter-evans PR (branch/label/body). Static-lint.
5. `apps/admin` — `findRunByJobId` + the `GET /api/jobs/[id]` correlation/status
   mapping; unit test. Confirm admin build stays green.
6. Verify — `pnpm -r typecheck` + codegen fixtures + admin build green; document
   the user-gated live dispatch smoke.
