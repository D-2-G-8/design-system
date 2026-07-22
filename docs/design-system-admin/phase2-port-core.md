# Phase 2 — port the codegen core into packages/codegen

Move the reusable codegen logic OUT of ai-tools-app (serverless/DB/GitHub-API-bound)
INTO a `packages/codegen` workspace package in the design-system monorepo — file-
based (git = state) + client-based (single service tokens), runnable as a CLI the
GitHub Actions worker invokes. NO validation loop / git here (that's Phase 3); Phase 2
is the PORT + a minimal `generate` CLI that does distill → generate → WRITE files.

## Decisions (locked)
- Core lives in **`packages/codegen`** (importable API + a `codegen` CLI bin).
- **The CLI writes files only**; the workflow does branch/commit/PR (Phase 3).
- File loaders replace DB; single-token clients replace OAuth/multi-tenant.

## Package: `packages/codegen`
- TS package (its own `package.json`/`tsconfig`), builds to `dist`, `bin: { codegen: dist/cli.js }`.
- Deps: `@anthropic-ai/sdk` (or the `ai` SDK, matching ai-tools-app), `zod`. NO next/db/drizzle/github.
- Env (from Actions secrets at runtime): `FIGMA_ACCESS_TOKEN`, `ANTHROPIC_API_KEY`,
  optional `CODEGEN_MODEL` (default a current Claude model id).

## Port inventory (from ai-tools-app/src/lib/design-system-codegen + clients)
PORT ~as-is (pure — no coupling):
- `checks.ts`, `review/deterministic.ts`, `review/prop-types.ts`, `review/types.ts`,
  `paths.ts` (slugify/componentIdentifier/paths/stand-url), `icon.ts`, `tokens.ts`
  (the pure `generateTokensCss` + `toCssVarName`).

PORT with a client swap (LLM/Figma — drop server-only, swap the client source):
- `figma-node.ts` (distiller), `component.ts` (contract + generateTsx/Css/Stories +
  **holisticFix** + prompts + the deterministic-first naming + scss-from-tsx-classes),
  `review/reviewer.ts`, `review/index.ts` (reviewAndFix), `visual-diff.ts`,
  `token-derive.ts`, `dependencies.ts`.

CLIENTS (port, stripped to single service token):
- `figma/client.ts` → `codegen/figma.ts`: `figmaGet` + `getFileImages` etc., auth =
  `FIGMA_ACCESS_TOKEN` PAT via `X-Figma-Token` (drop OAuth/session).
- `getAnthropicClient` → `codegen/anthropic.ts`: a thin wrapper over the SDK using
  `ANTHROPIC_API_KEY`; `getEffectiveModel` → `CODEGEN_MODEL ?? <default>`.

REPLACE (DB/GitHub → files/none):
- `data.ts` + all DB reads (loadTokensForCss, committed-component lookups, contractJson)
  → **file loaders** `codegen/loaders.ts`:
  - `loadManifest()` ← `design-system.manifest.json`
  - `loadTokens()` ← `tokens/tokens.json` (→ the `TokenForCss[]` the generators expect)
  - `loadComponentContract(slug)` ← `packages/components/src/.../<slug>.contract.json`
  - `loadCommittedContracts()` ← every existing `*.contract.json` (composition grounding)
  - `writeComponent(slug, files, contract)` → write the 4 files + `<slug>.contract.json`
    under `packages/components/src/{components|icons}/<slug>/`.
- `github/client.ts` commit/PR, `session.ts`, `reconcile.ts`, `ci-autofix.ts`, `ci-map.ts`,
  `visual-review.ts`, `screenshot/client.ts`, `mockup-*`, `screen-story.ts` → **NOT ported**
  (git/CI/screenshot are the workflow's job in Phase 3; mockups/screens are out of scope).

## CLI (`packages/codegen/src/cli.ts`)
`codegen generate <slug> [--icon]`:
1. `loadManifest()` → find the component's `figmaNodeIds/name/isIcon/variants/states`.
2. `loadTokens()`, `loadCommittedContracts()` (for composition + valid values).
3. Distill the Figma node (`figma-node.ts` + Figma client) → design spec + `uses`.
4. Generate (the ported pipeline: contract → tsx → scss-from-tsx-classes → stories) +
   the deterministic gates as a fast pre-pass (no LLM review/holisticFix loop yet — that
   full validation loop is Phase 3; Phase 2 may run one deterministic-gate pass + a single
   holisticFix if gates fail, to keep the CLI useful, but NOT the tsc/Playwright/vision loop).
5. `writeComponent(...)` → files land in the working tree. Print a summary (exit 0/non-0).
- Also `codegen --help` and a `codegen doctor` (checks env/manifest presence) for scaffolding.

## Scope boundary (Phase 2 vs 3)
- **Phase 2 (this):** the package exists, ports compile (tsc-green over packages/codegen),
  file loaders + clients work, the CLI runs `generate` end-to-end WRITING files (a live run
  needs FIGMA/ANTHROPIC env; a dry `--help`/`doctor` runs with none). Deterministic gates run;
  the FULL validation loop (real tsc over the built package + Storybook + Playwright + vision +
  the holisticFix-until-green loop) and git/PR are **Phase 3**.
- **Phase 3:** wire the CLI's generate into the loop (build+tsc+playwright+vision → holisticFix →
  repeat), and the workflow's create-PR step; `generate.yml` calls `codegen generate` for real.

## Generality (CLAUDE.md — carries over)
All the deterministic-first / no-per-component-rules discipline ports verbatim (naming from
slug, contracts drive values, tokens from tokens.json). Nothing per-component.

## Testing
- The pure ports keep their fixture tests (port `test-*.ts` into `packages/codegen`'s test dir
  or keep running them against the moved source): prop-types, value-gates, composition-imports,
  build-maps, ci-map(n/a), slugify, stand-url — re-point imports to `packages/codegen`.
- Loaders: fixture over a temp dir with sample contract.json/tokens.json/manifest.
- `tsc --noEmit` over packages/codegen green; the CLI `--help`/`doctor` runs with no env.
- A live `generate` run (Figma+Anthropic) is user-gated (costs money) — smoke, not in CI.

## Migration mechanics
- COPY (don't delete from ai-tools-app yet — cutover is Phase 6). Port = copy the files into
  `packages/codegen/src`, strip `server-only`/`@/db`/`@/lib/github`, swap client imports to the
  local `figma.ts`/`anthropic.ts`, swap DB reads to `loaders.ts`. Keep names/logic identical.
- The ai-tools-app design-system tool keeps working until Phase 6 retires it.

## Ordered outline (for the plan)
1. `packages/codegen` package scaffold (package.json/tsconfig/bin, deps) + `anthropic.ts` + `figma.ts` clients (single-token).
2. Port the PURE modules (+ their fixtures re-pointed) — tsc-green.
3. `loaders.ts` (manifest/tokens/contracts read + writeComponent) + fixture.
4. Port the LLM/distiller modules (component/reviewer/figma-node/visual-diff/token-derive/dependencies) swapping clients+loaders — tsc-green.
5. `cli.ts` (generate/doctor/help) wiring loaders→distill→generate→write; `doctor`/`--help` run with no env.
6. Verify: tsc-green, fixtures pass, CLI `doctor` OK; document a live `generate` smoke (user-gated).
