# @d-2-g-8/codegen

Design-system codegen core, ported out of `ai-tools-app` (Phase 2 of the
design-system-admin migration — see `docs/design-system-admin/`). It distills a
component's real Figma design + composition and generates React `.tsx` +
`.module.scss` + Storybook `.stories.tsx` + a `<slug>.contract.json`, writing
them into `packages/components`.

State is **git**, not a database: the manifest, `tokens/tokens.json`, and each
`<slug>.contract.json` are the inputs (see
`docs/design-system-admin/conventions.md`). Clients are **single-token**:
`FIGMA_ACCESS_TOKEN` (a `figd_` PAT) and `ANTHROPIC_API_KEY`.

## CLI

    pnpm --filter @d-2-g-8/codegen codegen doctor
    pnpm --filter @d-2-g-8/codegen codegen generate <slug> [--icon]

`doctor` and `--help` need no environment. `generate` needs `FIGMA_ACCESS_TOKEN`
(+ `ANTHROPIC_API_KEY` for non-icon components); `CODEGEN_MODEL` overrides the
model, `FIGMA_FILE_KEY` overrides the manifest's `figmaFileKey`.

## Scope (Phase 2)

`generate` runs **distill → generate → write files** plus the in-process
deterministic gates + LLM review + holistic-fix loop that already lives in the
port. It does NOT run real `tsc` / Storybook / Playwright / vision, and does NOT
commit or open a PR — those are the Phase 3 GitHub Actions worker's job. This
package is what that workflow invokes.

## Dev

    pnpm --filter @d-2-g-8/codegen typecheck   # tsc --noEmit
    pnpm --filter @d-2-g-8/codegen test        # node:test fixtures via tsx
    pnpm --filter @d-2-g-8/codegen build        # tsup -> dist (bin: codegen)
