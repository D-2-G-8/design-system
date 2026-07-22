# Design-system admin service — target architecture + migration

Big re-architecture. Move ALL design-system logic OUT of the serverless platform
(`ai-tools-app`) INTO the design-system repo itself, as a hosted admin **service**
co-located with the components — so the whole generate→validate→publish loop runs
in a real Node/browser toolchain (no serverless constraints, no cross-repo dance).

## Decisions (locked)
- **State = git/repo.** Contracts/tokens/metadata are committed FILES; git history
  is the state. No service DB for component state → reconcile/pending-PR drift GONE.
- **One repo:** extend `D-2-G-8/design-system` into a **pnpm monorepo**.
- **Execution (REVISED — user keeps Vercel):** the WORKER is a **GitHub Actions
  workflow** in the design-system repo (real toolchain: Node/git/Chromium/pnpm/tsc/
  Playwright — no serverless limits, no container to host). The admin UI triggers it
  via `workflow_dispatch` and polls the run. Reuses the CI-annotation reading we
  already built.
- **Admin stack (REVISED):** **Next.js on Vercel** — UI + light API only (dashboard,
  review, trigger, poll). No browser / no long jobs / no persistent FS in the admin
  itself → serverless-fine. (Superseded: the earlier "Next.js in a container on
  Fly/Railway with Chromium + SQLite volume" — dropped because the user keeps Vercel;
  GitHub Actions is the toolchain instead of a hosted container.)
- **Job/progress state:** a small **Vercel Postgres/Neon** (job rows + workflow-run
  ids) — NOT component state (that's git). Replaces the SQLite-on-a-volume idea.
- **Publish:** on **merge to main**, CI bumps a **whole-library semver** and
  `npm publish`es `@org/design-system` to **Artifactory**.

## Target monorepo layout
```
design-system/ (pnpm workspaces; Docker: node + playwright/chromium)
  packages/components/            the PUBLISHED library (@org/design-system)
    src/components/<slug>/        Button.tsx .module.scss .stories.tsx index.ts
                                  button.contract.json   <- persisted contract (was a DB row)
    src/icons/<slug>/             deterministic SVG icons
    src/tokens/tokens.css         generated from tokens.json
    package.json  tsconfig  .storybook/
  tokens/tokens.json              token source of truth (was DB rows)
  design-system.manifest.json     component inventory + figmaNodeIds/isIcon (was DB)
  tests/visual/                   Playwright specs + __screenshots__ baselines
  apps/admin/                     the SERVICE (Next.js standalone)
    UI: sync / generate / review / approve / publish
    worker: the long generate+validate loop
    lib/: the PORTED core (below)
    Dockerfile
  .github/workflows/              PR CI (tsc/lint/build/storybook/playwright) + publish-on-merge
  .npmrc                          Artifactory registry + token (CI)
```

## What PORTS vs what's REPLACED (from the ai-tools-app inventory)
- **Ports ~unchanged (not serverless-specific):** `figma-node.ts` (distiller),
  `component.ts` (contract+tsx+scss-from-tsx-classes+stories+**holisticFix**+prompts),
  `review/{deterministic,checks,prop-types,types,reviewer}.ts` (gates + LLM review),
  `paths.ts` (naming/slugify/stand-url), `icon.ts`+`icon-fetch.ts`, `token-derive.ts`,
  `tokens.ts`, `visual-diff.ts` (Figma-vision), `dependencies.ts`. The Figma + Anthropic
  clients port too (drop the OAuth/session multi-tenant bits → a single service token).
- **REPLACED by git/toolchain-native equivalents:** `ci-autofix.ts` + `ci-map.ts`
  (CI-annotation reading → just run `tsc` in-process), `reconcile.ts` + `session.ts`
  (DB↔repo drift + session branches → git is the state), `visual-review.ts` +
  `screenshot/client.ts` (external screenshot API → Playwright screenshot locally),
  all serverless routes (→ worker jobs), all Drizzle/DB loaders in `data.ts`
  (→ read the repo's contract/token FILES).
- **Retired in ai-tools-app:** the whole design-system tool (routes, DB tables,
  settings UI). Honest: a lot of recent plumbing goes away; the CORE logic lives on
  in the admin. (The gates/naming/token/composition fixes we just made all port.)

## Component + state file model (git = truth)
- Each component dir carries its `*.contract.json` (props+types, cssVariables,
  classNames, figmaNodeIds, isIcon, name) NEXT TO the code — the exact data that was
  `design_component.contractJson` + the row. Composition grounding reads sibling
  `*.contract.json` files (was: committed DB rows).
- `tokens/tokens.json` = token source; `packages/components/src/tokens/tokens.css`
  generated from it.
- `design-system.manifest.json` = the curated component inventory from the last Figma
  sync (name/slug/isIcon/figmaNodeIds/variants/states) — replaces the metadata rows.
- **"committed"/"never"/"failed" status → derived from the filesystem + git** (a
  component's files exist & are committed = committed; a branch/PR is open = pending).
  No status column, no reconcile.

## The generate→validate→publish loop (worker, in-process)
Enqueue `generate(slug)` (or a batch/closure). The worker, in a working git branch:
1. **Distill** the Figma node (service Figma token).
2. Load composed children's contracts from their sibling `*.contract.json`.
3. **Generate** (ported pipeline): contract → tsx → **scss from the tsx's actual
   classes** → stories. Deterministic naming (slugify/componentIdentifier).
4. Write the 4 files + `*.contract.json` to the branch.
5. **Validate IN-PROCESS (the whole point):**
   - real `tsc --noEmit` over the package (catches EVERYTHING the deterministic
     gates + external CI-loop approximated — enum values, expression props, missing
     required props, cross-component types),
   - deterministic gates (A1–A7c) as a fast pre-pass,
   - `pnpm build-storybook` (or a targeted vite render),
   - **Playwright** screenshot the story (deterministic render) → (a) Figma-**vision-diff**
     (LLM) for fidelity, (b) **pixel-diff** vs the committed baseline for regression,
   - `holisticFix` on any failure — now fed REAL tsc errors + REAL visual diffs.
6. Loop until green (or N) → commit the component + contract. Escalate to the human
   (the admin review UI) past the limit.
7. **Open a PR** (or auto-commit to a review branch). The admin UI shows the diffs,
   tsc/visual results, and the PR link.

## Distribution
- On **merge to main**, `.github/workflows/publish` bumps a whole-library **semver**
  and `npm publish`es `packages/components` (`@org/design-system`) to **Artifactory**
  (`.npmrc` registry + `NPM_TOKEN`). Consumers: `npm i @org/design-system@x.y.z`.
- Storybook still deploys per branch (preview) for humans; the admin's Playwright is
  the automated gate.

## Hosting / ops (Vercel + GitHub Actions)
- `apps/admin` → **Vercel** (Next.js, like ai-tools-app). UI + API only. No Docker.
- **Worker = GitHub Actions** in the design-system repo. The admin API route calls
  `POST /repos/{o}/{r}/actions/workflows/generate.yml/dispatches` with `{slug, jobId}`;
  the workflow runs the whole loop on a real runner, commits, opens a PR, and the run
  status/PR/annotations are what the admin polls/reads.
- **Job store** = a small **Vercel Postgres/Neon** (`JOB_DB_URL`): `job` rows
  (id, kind, slug, status, workflowRunId, progress, log). Job history only — component
  state is git.
- Secrets: on **Vercel** the admin needs `GITHUB_TOKEN` (dispatch + read runs/PRs) +
  `JOB_DB_URL` (+ auth). On **GitHub** (repo/Actions secrets) the WORKFLOW needs
  `FIGMA_ACCESS_TOKEN`, `ANTHROPIC_API_KEY` (LLM/Figma run inside Actions), and the
  publish `NODE_AUTH_TOKEN` (GitHub Packages). Single-tenant admin auth.
- Trade-off: the worker is a CI run (minutes, GitHub-managed concurrency/queue) rather
  than an always-warm container — fine for an internal admin; and it keeps Vercel + reuses
  the CI/annotation machinery already built.

## Migration — phased (each phase = its own spec→plan→SDD later)
1. **Monorepo scaffold** — pnpm workspaces; `packages/components` layout + the
   `*.contract.json` convention + `design-system.manifest.json`; move the existing
   components/Storybook in; Playwright + baselines; `.npmrc` + publish CI; Dockerfile;
   the job store. (No LLM yet — just structure + CI + hosting skeleton.)
2. **Port the core** — distiller, contracts/prompts/holisticFix, gates, paths/naming,
   icon, token-derive, vision-diff, Figma + Anthropic clients → `apps/admin/lib`
   (or a shared `packages/codegen`). Replace DB loaders with file loaders; replace
   GitHub-API commits with local git (simple-git/exec).
3. **Worker loop + queue** — enqueue generate/regenerate; the IN-PROCESS validate
   loop (real tsc + gates + Storybook + Playwright + vision-diff + pixel-diff) +
   holisticFix; commit + PR.
4. **Admin UI** — components list/status from git; generate buttons; live progress;
   validation review (vision findings + pixel diffs); approve/PR.
5. **Publish pipeline** — semver bump + Artifactory publish on merge; consumer docs.
6. **Cutover** — retire ai-tools-app's design-system tool; point users at the admin.

## Honest trade-offs / risks
- Big pivot; retires much recent ai-tools-app plumbing (external screenshot API,
  CI-annotation loop, reconcile, session branches, the DB tables). The CORE ports.
- The admin now needs **container ops** (Docker + Chromium + a host) the serverless
  platform didn't — real but standard.
- git-as-state means concurrency is git-serialized (one working branch at a time per
  component) — the queue handles ordering.
- Figma is single-tenant here (one service token) — fine for one design system; not a
  multi-workspace product anymore (that was the platform's job, now out of scope).
- Playwright pixel-baselines need deterministic render (software GL, disabled hinting,
  blocked external net) — merchant-portal's config is a proven template to copy.

## Decomposition note
This spec is the ARCHITECTURE + decomposition. It is NOT a single implementation plan.
Next step: brainstorm→spec→plan **Phase 1 (monorepo scaffold)** specifically, then
proceed phase by phase.
