# Phase 3b — visual contour (v1)

Add the **visual gate** to the worker: after the Phase-3a code contour passes
(`tsc` + deterministic gates green), build Storybook, **screenshot** the
component's Default story, **vision-diff** it against the Figma render, establish
a committed **pixel baseline**, and surface the visual findings on the PR — all
**advisory** (the run stays `success`, the PR opens regardless; a human reviews).

Builds on Phase 3a (the worker loop + per-component PR) and Phase 2's ported
`visual-diff.ts` (`reviewVisualDiff`), `figma.ts` (`getFileImages`), and the
Phase-1 Playwright scaffold (`tests/visual/`, deterministic config). Source-of-
truth docs: `architecture.md`, `phase3a-worker-loop.md` (this dir).

## Locked decisions (settled with the user)

1. **Advisory gate, no auto-fix loop.** After tsc-green: build Storybook →
   screenshot Default story → vision-diff vs Figma + establish/update the pixel
   baseline → put findings in the PR body + a `visual-review` label. NO in-CI
   fix loop over visual findings (too slow/expensive). The run stays `success`;
   visual never blocks. A human — or a re-dispatch — drives visual iteration.
2. **Default story only.** One screenshot + one vision-diff + one baseline per
   component. Per-state / all-stories = v2 (needs a story↔Figma-variant map).
3. **CLI/workflow seam.** Playwright (browser) is a **workflow step**; the LLM +
   Figma calls are a **CLI command** (`codegen visual`). The screenshot/baseline
   run in the workflow; the vision-diff runs in the CLI (it has the clients + the
   worker's `ANTHROPIC_API_KEY`).
4. **Pixel baseline = committed PNG.** The worker commits the screenshot as the
   baseline in the PR. CI's existing `visual` job (no LLM) compares against it →
   a fresh PR stays green; on a later regeneration the **committed PNG git-diff
   is the human-readable regression signal**. No automated pixel pass/fail block.

## Architecture / data flow (worker, extending 3a)

```
codegen generate <slug>          (3a: tsc + gates + holisticFix)  → files + codegen-result.json (passed)
        │
install Chromium                 (re-added; removed in Phase 1). Storybook is built by Playwright's webServer.
        │
Playwright test --update-snapshots -g "^visual: <slug>$"   → webServer builds Storybook; writes committed baseline
                                    tests/visual/__screenshots__/linux/<slug>.png   (== the rendered screenshot)
        │
codegen visual <slug> --rendered tests/visual/__screenshots__/linux/<slug>.png
        │  getFileImages(fileKey,[nodeId]) → figma URL → download PNG bytes
        │  reviewVisualDiff(rendered, figma) → visual findings (severity "quality")
        │  → visual-result.json  { slug, ran, findings, model }
        ▼
create-PR: code + the new/updated baseline PNG + (codegen-result + visual-result) findings in the body
           + `needs-human` (code findings, 3a) and/or `visual-review` (visual findings) labels
```

Figma nodeId empty (seed Button) or the Figma render fails → `ran:false`, no
findings (skip the vision-diff) — same graceful degrade as 3a. Everything visual
is advisory; the run concludes `success` whenever a PR opened.

## Part A — CLI `codegen visual` (`packages/codegen`)

New subcommand `codegen visual <slug> --rendered <png-path> [--result-file <path>]`:
1. `loadManifest`/`loadComponentContract` → `figmaFileKey` + the component's
   `figmaNodeIds[0]` + `name`/`isIcon`. If no nodeId → write `{ slug, ran:false,
   findings:[], model }` and exit 0.
2. `getFigmaAccessToken()`; **fetch the Figma render**: `getFileImages(fileKey,
   [nodeId], token, { format:"png", scale:2 })` → a nodeId→URL map → `fetch(url)`
   → PNG bytes (new `figma-image.ts` helper `fetchNodeImage(fileKey, nodeId,
   token): Promise<{ bytes: Uint8Array; mediaType: string } | null>`, mirroring
   `icon-fetch.ts`'s fetch-the-returned-URL pattern).
3. Read the rendered PNG bytes from `--rendered` (`readFileSync`).
4. `reviewVisualDiff(getCodegenModel(), figma, rendered, componentName,
   designSpec?)` → findings (severity "quality"). Best-effort (`reviewVisualDiff`
   already returns [] on failure).
5. Write `visual-result.json` (default `<repoRoot>/visual-result.json`,
   gitignored) = `{ slug, ran:true, findings: {area,severity,description,
   suggestion?}[], model }`. Exit 0 (advisory — never blocks). Hard errors
   (unreadable rendered file) → non-zero.

New modules: `figma-image.ts` (`fetchNodeImage`), and the `visual` command wiring
in `cli.ts`. Reuses `reviewVisualDiff` (visual-diff.ts), `getFileImages`
(figma.ts), the loaders. `doctor`/`--help` gain the `visual` usage; still no-env.

## Part B — the general Playwright spec (`tests/visual`)

Replace the smoke-only suite with a **general, data-driven** spec
`tests/visual/components.spec.ts`:
- Read `design-system.manifest.json` (repo root) → the committed components/icons.
- For each whose component **directory exists** under `packages/components/src`
  (i.e. actually generated — a manifest entry without a dir is skipped), derive
  its Default story id via the same rule as `storybookDefaultStoryId(slug,isIcon)`
  (`{components|icons}-<identifier>--default`, identifier = `componentIdentifier`),
  in a test **titled exactly `visual: <slug>`**, navigate to
  `iframe.html?id=<storyId>&viewMode=story`, and
  `await expect(page.locator("#storybook-root")).toHaveScreenshot(`${slug}.png`)`.
- No per-component spec files; the list is derived from the manifest. Keep the
  deterministic-render config + the `webServer` (build-storybook + serve) as-is —
  the `webServer` already builds Storybook, so the worker needs NO separate
  build-storybook step.
- Keep `smoke.spec.ts` (proves Storybook wiring) or fold it in.

The **worker** runs this spec with `--update-snapshots -g "^visual: <slug>$"`
(the grep is over the TEST TITLE, anchored so a prefix-colliding sibling —
`button` vs `button-group` — is NOT also updated) to (re)establish only the
target component's baseline. The baseline name is `<slug>.png` (via the
`toHaveScreenshot` arg + the config's `{platform}/{arg}{ext}` template → no
project/platform suffix beyond `{platform}`).
**CI's `visual` job** runs it WITHOUT `--update-snapshots` over all committed
components → compares vs the committed baselines (the regression gate; no LLM).

Baselines live at `tests/visual/__screenshots__/{platform}/<slug>.png`, platform-
scoped (already in the config). The runner is **linux** (ubuntu) → linux baselines
are the source of truth; a macOS dev won't match them locally (expected).

## Part C — `generate.yml` visual steps

Extend the 3a workflow (insert BEFORE create-pull-request; keep run-name,
permissions, injection-safe env):
- Re-add the **Chromium install**: `pnpm exec playwright install --with-deps
  chromium` (removed in Phase 1; `@playwright/test` is a real dep now).
- No separate `build-storybook` step — the Playwright `webServer` already builds
  and serves Storybook (see `playwright.config.ts`).
- **Playwright update-baseline step** (env `SLUG`): `pnpm exec playwright test -c
  tests/visual/playwright.config.ts --update-snapshots -g "^visual: $SLUG\$"` →
  writes the committed baseline; `continue-on-error: true` (a screenshot hiccup
  must not fail the run — visual is advisory).
- **`codegen visual`** step (env `SLUG`, `ANTHROPIC_API_KEY`, `FIGMA_ACCESS_TOKEN`):
  `corepack pnpm --filter @d-2-g-8/codegen codegen visual "$SLUG" --rendered
  tests/visual/__screenshots__/linux/"$SLUG".png`; `continue-on-error: true`.
- **Read result** step: extend the jq to also read `visual-result.json` — set a
  `visual_findings` count + append a "Visual review vs Figma" section to the PR
  body; set a flag to add the `visual-review` label when `> 0`.
- **create-pull-request**: `add-paths: |` now lists BOTH `packages/components`
  and `tests/visual/__screenshots__`; `labels:` combines `needs-human` (code) and
  `visual-review` (visual). `visual-result.json` is gitignored (never committed).

## Testing

- **`figma-image.ts`** `fetchNodeImage`: fixture with an injected `getFileImages`
  + `fetch` (fake) → returns bytes for a URL, null when the map has no URL / the
  fetch fails. Pure-ish (inject the fetch).
- **CLI `visual`**: fixture over the result-json logic with injected
  `reviewVisualDiff` + `fetchNodeImage` + a temp rendered PNG — (a) no nodeId →
  `ran:false`; (b) findings passthrough → `visual-result.json` shape; (c)
  vision-outage → `ran:true, findings:[]`. No network/LLM.
- **Playwright spec**: `tsc`/parse-clean; the manifest-enumeration logic (which
  components get a story) unit-tested if extracted as a pure helper. A real
  baseline compare is the live smoke (needs a generated component + Storybook).
- **Workflow**: `yaml.safe_load` + actionlint (if present) + careful review; a
  live dispatch is the user-gated smoke.
- Full `pnpm -r typecheck` + codegen fixtures + admin build green; lockfile v9.

## Preconditions for a live run (ops — user)

- Everything from 3a (repo secrets `FIGMA_ACCESS_TOKEN`/`ANTHROPIC_API_KEY`,
  "Allow Actions to create PRs", a component with real `figmaNodeIds`).
- The worker installs Chromium at run time (`playwright install`); no extra
  secret. The first run for a component **establishes** its baseline (no prior
  baseline to diff — expected).

## Out of scope (later)

- **v2:** all stories / per-state, with a story↔Figma-variant mapping; a bounded
  visual fix loop (feed vision findings into `holisticFix`).
- Batch/closure; fine-grained progress; the admin surfacing the `visual-review`
  label (Phase 4 UI).

## Ordered outline (for the plan)

1. `figma-image.ts` (`fetchNodeImage`) + fixture.
2. CLI `visual` command + `visual-result.json` + `.gitignore`; fixtures
   (injected `reviewVisualDiff`/`fetchNodeImage`).
3. `tests/visual/components.spec.ts` — general manifest-driven per-Default-story
   `toHaveScreenshot`; keep deterministic config; (extract + unit-test the
   manifest→stories helper).
4. `generate.yml` — Chromium install + Playwright update-baseline step +
   `codegen visual` step + extended Read-result + create-PR (add-paths + labels).
5. Full verify + live-smoke doc.
