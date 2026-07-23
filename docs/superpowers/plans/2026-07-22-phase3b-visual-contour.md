# Phase 3b — Visual Contour (v1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an **advisory** visual gate to the worker: after the Phase-3a code contour passes, screenshot the component's Default story, vision-diff it vs the Figma render, establish a committed pixel baseline, and surface the findings on the PR — never blocking the run.

**Architecture:** Split along the toolchain seam — Playwright (browser) is a **workflow step** that screenshots the Default story and writes the committed pixel baseline; the LLM + Figma calls are a **CLI command** (`codegen visual`) that fetches the Figma render and runs `reviewVisualDiff` → `visual-result.json`. A general, manifest-driven Playwright spec provides both the baseline generator (worker, `--update-snapshots`) and the regression gate (CI's existing `visual` job). Everything visual is severity `quality`; the PR opens regardless.

**Tech Stack:** TypeScript 5.9 (ESM), Node 22, `@playwright/test` (deterministic config, already scaffolded), the ported `visual-diff.ts` (`reviewVisualDiff`) + `figma.ts` (`getFileImages`), `tsx`/`node:test`, GitHub Actions.

## Global Constraints

- **Spec:** `design-system/docs/design-system-admin/phase3b-visual-contour.md` — source of truth; every task defers to it.
- **Branch:** `phase3b-visual-contour`, off **`phase3a-worker-loop`** (NOT master — 3b builds on 3a's `codegen generate` loop + `generate.yml`). Commit the spec on this branch (Task 1). NEVER commit to master; NEVER `git add -A`. **3b's PR should be opened after 3a merges to master** (so it shows only 3b's commits); until then it stacks on 3a.
- **Locked decisions:** advisory gate, **no auto-fix loop** (visual findings never block; run stays `success`); **Default story only** (1 screenshot + 1 vision call); CLI/workflow seam (Playwright = workflow, vision = CLI); **committed-PNG baseline** (worker commits it; the git-diff of the PNG on a later regen is the regression signal; CI's `visual` job compares — no automated pixel pass/fail).
- **Reuse (do not reimplement):** `reviewVisualDiff(model, figma, rendered, componentName, spec?)` (`./visual-diff`); `getFileImages` (`./figma`); `getFigmaAccessToken`, `getCodegenModel` (`./figma`/`./anthropic`); `loadManifest`, `loadComponentContract` (`./loaders`); `storybookDefaultStoryId`, `componentIdentifier` (`./paths`); `type Finding` (`./review`).
- **Testability:** all side effects (fetch, `getFileImages`, `reviewVisualDiff`, fs reads) injected → unit tests hit no network/LLM/browser.
- **Tooling:** use `corepack pnpm`. Typecheck `corepack pnpm --filter <pkg> exec tsc --noEmit`; fixtures `corepack pnpm --filter <pkg> exec tsx --test <files>`.
- **Discipline:** everything GENERAL — the visual spec derives its component list from the manifest + Storybook's own story ids, not hardcoded names. English only. `cd` into the repo dir each shell call.
- **Out of scope:** per-state/all-stories, story↔Figma-variant mapping, any visual fix loop, batch, admin UI surfacing.

## File Structure

```
packages/codegen/src/
  figma-image.ts   NEW — fetchNodeImage (getFileImages → download PNG bytes), deps injectable
  visual.ts        NEW — runVisualReview (pure orchestration; injected fetchImage/reviewDiff/readRendered)
  cli.ts           MODIFY — `visual` subcommand + HELP
  index.ts         MODIFY — export figma-image + visual
packages/codegen/test/
  figma-image.test.ts   NEW
  visual-review.test.ts NEW
.gitignore         MODIFY — ignore visual-result.json
tests/visual/
  components.spec.ts    NEW — general manifest-driven per-Default-story toHaveScreenshot
  playwright.config.ts  MODIFY — updateSnapshots: 'none'
.github/workflows/generate.yml   MODIFY — Chromium install + Playwright baseline step + codegen visual + combined Read/labels/add-paths
```

---

## Task 1: Branch + spec + `figma-image.ts` (`fetchNodeImage`)

**Files:**
- Create branch `phase3b-visual-contour` off `phase3a-worker-loop`; commit the spec.
- Create: `packages/codegen/src/figma-image.ts`
- Test: `packages/codegen/test/figma-image.test.ts`

**Interfaces:**
- Produces: `fetchNodeImage(fileKey: string, nodeId: string, accessToken: string, deps?: { getImages?: typeof getFileImages; fetchImpl?: typeof fetch }): Promise<{ bytes: Uint8Array; mediaType: string } | null>`.

- [ ] **Step 1: Create the branch + commit the spec**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git fetch origin --quiet
git checkout phase3a-worker-loop && git pull --ff-only
git checkout -b phase3b-visual-contour
git add docs/design-system-admin/phase3b-visual-contour.md
git commit -m "docs(phase3b): visual-contour (v1) spec

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

- [ ] **Step 2: Write the failing test `packages/codegen/test/figma-image.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { fetchNodeImage } from "../src/figma-image";

const PNG = new Uint8Array([1, 2, 3]);
function okFetch() {
  return async () => ({ ok: true, arrayBuffer: async () => PNG.buffer }) as unknown as Response;
}

test("fetchNodeImage returns png bytes when the node renders", async () => {
  const r = await fetchNodeImage("F", "1:2", "figd_x", {
    getImages: async () => ({ "1:2": "https://figma/img.png" }),
    fetchImpl: okFetch(),
  });
  assert.deepEqual(r, { bytes: PNG, mediaType: "image/png" });
});

test("fetchNodeImage returns null when Figma has no URL for the node", async () => {
  const r = await fetchNodeImage("F", "1:2", "figd_x", {
    getImages: async () => ({ "1:2": null }),
    fetchImpl: okFetch(),
  });
  assert.equal(r, null);
});

test("fetchNodeImage returns null when the download fails", async () => {
  const r = await fetchNodeImage("F", "1:2", "figd_x", {
    getImages: async () => ({ "1:2": "https://figma/img.png" }),
    fetchImpl: async () => ({ ok: false }) as unknown as Response,
  });
  assert.equal(r, null);
});
```

- [ ] **Step 3: Run it → RED**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/figma-image.test.ts
```
Expected: FAIL — `Cannot find module '../src/figma-image'`.

- [ ] **Step 4: Write `packages/codegen/src/figma-image.ts`**

```ts
import { getFileImages } from "./figma";

/**
 * Fetch a Figma node's rendered PNG bytes (mirrors icon-fetch.ts: Figma's
 * images API returns a short-lived URL, which we then download). Returns null
 * when the node can't render or the download fails -- the caller degrades to a
 * "no visual review" result rather than failing (visual is advisory). Deps are
 * injectable so this is unit-testable without network.
 */
export async function fetchNodeImage(
  fileKey: string,
  nodeId: string,
  accessToken: string,
  deps: { getImages?: typeof getFileImages; fetchImpl?: typeof fetch } = {},
): Promise<{ bytes: Uint8Array; mediaType: string } | null> {
  const getImages = deps.getImages ?? getFileImages;
  const fetchImpl = deps.fetchImpl ?? fetch;
  const images = await getImages(fileKey, [nodeId], accessToken, { format: "png", scale: 2 });
  const url = images[nodeId];
  if (!url) return null;
  const res = await fetchImpl(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) return null;
  return { bytes: new Uint8Array(await res.arrayBuffer()), mediaType: "image/png" };
}
```

- [ ] **Step 5: GREEN + typecheck**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/figma-image.test.ts
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
```
Expected: 3/3 pass; `tsc --noEmit` exit 0.

- [ ] **Step 6: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/figma-image.ts packages/codegen/test/figma-image.test.ts
git commit -m "feat(codegen): fetchNodeImage — download a Figma node's rendered PNG

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 2: `visual.ts` (`runVisualReview`) + CLI `visual` command

**Files:**
- Create: `packages/codegen/src/visual.ts`
- Modify: `packages/codegen/src/cli.ts`, `packages/codegen/src/index.ts`, `.gitignore`
- Test: `packages/codegen/test/visual-review.test.ts`

**Interfaces:**
- Consumes: `fetchNodeImage` (Task 1), `reviewVisualDiff`, `getFileImages`, loaders, `type Finding`.
- Produces:
  - `runVisualReview(args): Promise<VisualResult>` where
    `interface VisualResult { slug: string; ran: boolean; findings: Finding[]; model: string }` and args carry the resolved inputs + injected deps `{ fetchImage, reviewDiff, readRendered }`.
  - CLI `codegen visual <slug> --rendered <png> [--result-file <path>]` → writes `visual-result.json` (default `<repoRoot>/visual-result.json`).

- [ ] **Step 1: Write the failing test `packages/codegen/test/visual-review.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { runVisualReview } from "../src/visual";
import type { Finding } from "../src/review";

const RENDERED = { bytes: new Uint8Array([9]), mediaType: "image/png" };
const FIGMA = { bytes: new Uint8Array([8]), mediaType: "image/png" };
const FINDING: Finding = { id: "visual-border", severity: "quality", file: "css", message: "[visual/major] border: too round" };

function base(over = {}) {
  return {
    slug: "button", componentName: "Button", fileKey: "F", nodeId: "1:2", token: "figd_x", model: "m",
    readRendered: () => RENDERED,
    fetchImage: async () => FIGMA,
    reviewDiff: async () => ({ findings: [FINDING], inputTokens: 0, outputTokens: 0 }),
    ...over,
  };
}

test("no nodeId → ran:false, no findings", async () => {
  const r = await runVisualReview(base({ nodeId: "" }) as never);
  assert.equal(r.ran, false);
  assert.deepEqual(r.findings, []);
});

test("rendered missing → ran:false", async () => {
  const r = await runVisualReview(base({ readRendered: () => null }) as never);
  assert.equal(r.ran, false);
});

test("figma render unavailable → ran:false", async () => {
  const r = await runVisualReview(base({ fetchImage: async () => null }) as never);
  assert.equal(r.ran, false);
});

test("both images present → ran:true, findings passthrough", async () => {
  const r = await runVisualReview(base() as never);
  assert.equal(r.ran, true);
  assert.equal(r.findings.length, 1);
  assert.equal(r.slug, "button");
});

test("vision returns no findings → ran:true, empty", async () => {
  const r = await runVisualReview(base({ reviewDiff: async () => ({ findings: [], inputTokens: 0, outputTokens: 0 }) }) as never);
  assert.equal(r.ran, true);
  assert.deepEqual(r.findings, []);
});
```

- [ ] **Step 2: RED**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/visual-review.test.ts
```
Expected: FAIL — `Cannot find module '../src/visual'`.

- [ ] **Step 3: Write `packages/codegen/src/visual.ts`**

```ts
import type { Finding } from "./review";

export interface VisualResult {
  slug: string;
  ran: boolean;
  findings: Finding[];
  model: string;
}

interface RenderedImage { bytes: Uint8Array; mediaType: string }

export interface RunVisualReviewArgs {
  slug: string;
  componentName: string;
  fileKey: string;
  nodeId: string; // "" when the component has no figmaNodeIds
  token: string;
  model: string;
  spec?: string;
  // Injected side effects:
  readRendered: () => RenderedImage | null;
  fetchImage: (fileKey: string, nodeId: string, token: string) => Promise<RenderedImage | null>;
  reviewDiff: (
    model: string,
    figma: RenderedImage,
    rendered: RenderedImage,
    componentName: string,
    spec?: string,
  ) => Promise<{ findings: Finding[]; inputTokens: number; outputTokens: number }>;
}

/** Advisory visual review: vision-diff the rendered Storybook screenshot vs the
 *  Figma render. ran:false (no findings) whenever an input is missing (no
 *  nodeId, no rendered screenshot, Figma can't render) -- never throws for those
 *  (visual is advisory). */
export async function runVisualReview(args: RunVisualReviewArgs): Promise<VisualResult> {
  const nil = (): VisualResult => ({ slug: args.slug, ran: false, findings: [], model: args.model });
  if (!args.nodeId) return nil();
  const rendered = args.readRendered();
  if (!rendered) return nil();
  const figma = await args.fetchImage(args.fileKey, args.nodeId, args.token);
  if (!figma) return nil();
  const { findings } = await args.reviewDiff(args.model, figma, rendered, args.componentName, args.spec);
  return { slug: args.slug, ran: true, findings, model: args.model };
}
```

- [ ] **Step 4: Wire the CLI `visual` command in `cli.ts`**

Add imports:
```ts
import { readFileSync } from "node:fs";
import { runVisualReview } from "./visual";
import { fetchNodeImage } from "./figma-image";
import { reviewVisualDiff } from "./visual-diff";
import { componentIdentifier } from "./paths";
```
Add a `visual` function (near `generate`):
```ts
async function visual(slug: string, opts: { rendered?: string; resultFile?: string }): Promise<number> {
  const root = findRepoRoot();
  const manifest = loadManifest(root);
  const existing = loadComponentContract(slug, root);
  const entry = manifest.components.find((c) => c.slug === slug) ?? manifest.icons.find((c) => c.slug === slug) ?? null;
  const isIcon = existing?.isIcon ?? entry?.isIcon ?? false;
  const nodeId = (existing?.figmaNodeIds ?? entry?.figmaNodeIds ?? [])[0] ?? "";
  const token = getFigmaAccessToken();
  const model = getCodegenModel();
  const result = await runVisualReview({
    slug,
    componentName: componentIdentifier(slug),
    fileKey: manifest.figmaFileKey ?? process.env.FIGMA_FILE_KEY ?? "",
    nodeId: token && (manifest.figmaFileKey || process.env.FIGMA_FILE_KEY) ? nodeId : "",
    token: token ?? "",
    model,
    readRendered: () => {
      if (!opts.rendered) return null;
      try { return { bytes: new Uint8Array(readFileSync(opts.rendered)), mediaType: "image/png" }; }
      catch { return null; }
    },
    fetchImage: (fk, nid, tk) => fetchNodeImage(fk, nid, tk),
    reviewDiff: (m, f, r, cn, sp) => reviewVisualDiff(m, f, r, cn, sp),
  });
  const path = opts.resultFile ?? join(root, "visual-result.json");
  writeFileSync(path, JSON.stringify(result, null, 2) + "\n");
  console.log(`visual → ${path} (ran=${result.ran}, findings=${result.findings.length})`);
  void isIcon;
  return 0; // advisory: never blocks
}
```
Wire it in `main`'s dispatch (after the `generate` branch):
```ts
  if (cmd === "visual") {
    const rest = argv.slice(1);
    const slug = rest.find((a) => !a.startsWith("-"));
    if (!slug) { console.error("visual needs a <slug>. See `codegen --help`."); return 1; }
    const rIdx = rest.indexOf("--rendered");
    const rendered = rIdx >= 0 ? rest[rIdx + 1] : undefined;
    const rfIdx = rest.indexOf("--result-file");
    const resultFile = rfIdx >= 0 ? rest[rfIdx + 1] : undefined;
    return visual(slug, { rendered, resultFile });
  }
```
Add a `visual` line to the `HELP` usage block (`codegen visual <slug> --rendered <png>  Vision-diff the rendered Default-story screenshot vs the Figma design; writes visual-result.json (advisory).`).

- [ ] **Step 5: Export + gitignore**

Append to `index.ts`:
```ts
export * from "./figma-image";
export * from "./visual";
```
(If TS2308, switch to explicit named re-exports.) Append to `.gitignore`:
```
# codegen visual-review result (read by the generate workflow; never committed)
visual-result.json
```

- [ ] **Step 6: Tests, typecheck, full suite, no-env help**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/visual-review.test.ts test/figma-image.test.ts
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
corepack pnpm --filter @d-2-g-8/codegen test
env -u FIGMA_ACCESS_TOKEN -u ANTHROPIC_API_KEY corepack pnpm --filter @d-2-g-8/codegen exec tsx src/cli.ts --help
```
Expected: all fixtures pass; `tsc --noEmit` exit 0; full suite green; `--help` shows the `visual` command with no env.

- [ ] **Step 7: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/visual.ts packages/codegen/src/cli.ts packages/codegen/src/index.ts packages/codegen/test/visual-review.test.ts .gitignore
git commit -m "feat(codegen): codegen visual — vision-diff Default story vs Figma → visual-result.json

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 3: General Playwright spec + config guard

**Files:**
- Create: `tests/visual/components.spec.ts`
- Modify: `tests/visual/playwright.config.ts` (add `updateSnapshots: 'none'`)

**Interfaces:** none exported — a Playwright spec. It reuses `storybookDefaultStoryId` from `packages/codegen/src/paths` (a pure module Playwright's TS loader can import).

- [ ] **Step 1: Add `updateSnapshots: 'none'` to the config**

Edit `tests/visual/playwright.config.ts` — add to the top-level `defineConfig({...})` object (near `retries`):
```ts
  // Baselines are only WRITTEN when the worker passes --update-snapshots
  // (=> 'all'); otherwise ('none') a missing baseline makes the per-component
  // test skip (see components.spec.ts) so CI stays green for not-yet-generated
  // components, while a PRESENT baseline is compared (the regression gate).
  updateSnapshots: 'none',
```

- [ ] **Step 2: Write `tests/visual/components.spec.ts`**

```ts
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import { storybookDefaultStoryId } from "../../packages/codegen/src/paths";

// Data-driven from the manifest: one screenshot test per COMMITTED component's
// Default story (a manifest entry whose component dir doesn't exist yet is
// skipped). No per-component spec files, no hardcoded names.
interface Entry { slug: string; isIcon: boolean }
const root = process.cwd(); // playwright is invoked from the repo root
const manifest = JSON.parse(readFileSync(join(root, "design-system.manifest.json"), "utf8")) as {
  components: Entry[]; icons: Entry[];
};
const committed = [...manifest.components, ...manifest.icons].filter((c) =>
  existsSync(join(root, `packages/components/src/${c.isIcon ? "icons" : "components"}/${c.slug}`)),
);

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!localhost)/, (route) => route.abort()); // determinism: no external net
});

for (const c of committed) {
  test(`visual: ${c.slug}`, async ({ page }, testInfo) => {
    const baseline = join(root, `tests/visual/__screenshots__/linux/${c.slug}.png`);
    // CI (updateSnapshots !== 'all') without a baseline: skip rather than fail —
    // the worker creates the baseline with --update-snapshots (=> 'all').
    if (testInfo.config.updateSnapshots !== "all" && !existsSync(baseline)) {
      test.skip(true, "no committed baseline yet");
    }
    const storyId = storybookDefaultStoryId(c.slug, c.isIcon);
    await page.goto(`iframe.html?id=${storyId}&viewMode=story`);
    await expect(page.locator("#storybook-root")).toHaveScreenshot(`${c.slug}.png`);
  });
}
```
Keep `smoke.spec.ts` as-is (it proves Storybook wiring independently).

- [ ] **Step 3: Verify the spec collects (no browser needed)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm exec playwright test -c tests/visual/playwright.config.ts --list 2>&1 | head -30
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
```
Expected: `--list` enumerates `visual: <slug>` tests (at least `visual: button` from the seed) + `smoke.spec.ts` — proving the spec loads and the cross-package import of `storybookDefaultStoryId` resolves under Playwright's TS loader. If the import fails to resolve, STOP and report (fallback: read Storybook's `storybook-static/index.json` at runtime in one looping test — but that loses per-slug `-g` scoping; escalate the tradeoff). Do NOT run a full `playwright test` (needs Chromium + a Storybook build).

- [ ] **Step 4: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add tests/visual/components.spec.ts tests/visual/playwright.config.ts
git commit -m "test(visual): general manifest-driven per-Default-story screenshots + baseline guard

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 4: `generate.yml` visual steps

**Files:**
- Modify: `.github/workflows/generate.yml`

**Interfaces:** consumes `codegen generate` (3a), `codegen visual` (Task 2), the Playwright spec (Task 3). Produces a PR that also carries the baseline PNG + visual findings + `visual-review` label.

- [ ] **Step 1: Insert the visual steps and combine the Read step**

Edit `.github/workflows/generate.yml`. After the existing "Generate + validate" step and BEFORE "Read result", insert:
```yaml
      - name: Install Chromium for Playwright
        run: pnpm exec playwright install --with-deps chromium

      - name: Screenshot + update baseline
        continue-on-error: true
        env:
          SLUG: ${{ inputs.slug }}
        # webServer (in playwright.config.ts) builds + serves Storybook; --update-snapshots
        # (=> 'all') writes the committed baseline for just this component (anchored grep).
        run: corepack pnpm exec playwright test -c tests/visual/playwright.config.ts --update-snapshots -g "^visual: $SLUG\$"

      - name: Visual review vs Figma
        continue-on-error: true
        env:
          SLUG: ${{ inputs.slug }}
          FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: corepack pnpm --filter @d-2-g-8/codegen codegen visual "$SLUG" --rendered tests/visual/__screenshots__/linux/"$SLUG".png
```
Then REPLACE the "Read result" step's body so it also folds in `visual-result.json` and emits a `labels` output:
```yaml
      - name: Read result
        id: result
        env:
          SLUG: ${{ inputs.slug }}
        run: |
          PASSED=$(jq -r '.passed' codegen-result.json)
          ROUNDS=$(jq -r '.rounds' codegen-result.json)
          VIS_RAN=false; VIS_N=0
          if [ -f visual-result.json ]; then
            VIS_RAN=$(jq -r '.ran' visual-result.json)
            VIS_N=$(jq -r '.findings | length' visual-result.json)
          fi
          LABELS=""
          [ "$PASSED" = "true" ] || LABELS="needs-human"
          if [ "$VIS_N" -gt 0 ]; then LABELS="${LABELS:+$LABELS,}visual-review"; fi
          echo "labels=$LABELS" >> "$GITHUB_OUTPUT"
          {
            echo "body<<RESULT_EOF"
            echo "Generated \`$SLUG\` via the codegen worker (fix rounds: $ROUNDS)."
            if [ "$PASSED" != "true" ]; then
              echo ""; echo "**Unresolved after the fix loop — needs a human:**"
              jq -r '.findings[] | "- \(.message)"' codegen-result.json
            fi
            if [ "$VIS_N" -gt 0 ]; then
              echo ""; echo "**Visual review vs Figma (advisory):**"
              jq -r '.findings[] | "- \(.message)"' visual-result.json
            elif [ "$VIS_RAN" != "true" ]; then
              echo ""; echo "_Visual review skipped (no Figma node id or render unavailable)._"
            fi
            echo "RESULT_EOF"
          } >> "$GITHUB_OUTPUT"
```
Finally, update the "Open/update PR" step: change `labels:` and `add-paths:`:
```yaml
          labels: ${{ steps.result.outputs.labels }}
          add-paths: |
            packages/components
            tests/visual/__screenshots__
```
(Leave `branch`/`base`/`title`/`body`/`commit-message` + the pinned SHA unchanged.)

- [ ] **Step 2: Static-validate**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/generate.yml')); print('YAML OK')"
command -v actionlint >/dev/null && actionlint .github/workflows/generate.yml || echo "actionlint not installed — careful diff review instead"
```
Expected: YAML parses; actionlint clean if present. Do NOT dispatch a live run.

- [ ] **Step 3: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add .github/workflows/generate.yml
git commit -m "feat(worker): visual gate — screenshot + baseline + vision-diff, advisory on the PR

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 5: Full verify + live-smoke doc

**Files:**
- Modify: `docs/design-system-admin/phase3b-visual-contour.md` (append the live-smoke command if not precise).

- [ ] **Step 1: Full verification**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm install
corepack pnpm -r typecheck
corepack pnpm --filter @d-2-g-8/codegen test
corepack pnpm --filter @d-2-g-8/codegen build
corepack pnpm exec playwright test -c tests/visual/playwright.config.ts --list >/dev/null && echo "playwright spec collects OK"
corepack pnpm -F @d-2-g-8/design-system build
grep -m1 lockfileVersion pnpm-lock.yaml
```
Expected: `-r typecheck` green (codegen + admin + components); codegen fixtures pass; codegen build ok; the Playwright spec collects; the library build is unaffected; lockfile stays v9. (`admin` is unchanged by 3b.)

- [ ] **Step 2: Generality + no cross-repo edits**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
! grep -rnE "slug\s*===\s*['\"]|=== *['\"](button|chip|avatar)" packages/codegen/src tests/visual && echo "GENERAL: no per-component branching"
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app && git status --porcelain
```
Expected: `GENERAL: ...`; `ai-tools-app` working tree empty.

- [ ] **Step 3: Document the live smoke**

Ensure the spec's preconditions section is accurate and add the exact commands (do NOT run them):
```markdown
### Live smoke (user-gated — costs Figma + Anthropic + CI browser time)
Preconditions: everything from 3a + the component actually generated (its dir +
Default story exist) so Playwright can screenshot it. From a repo checkout with
Chromium installed and the two env vars set:
    corepack pnpm exec playwright test -c tests/visual/playwright.config.ts --update-snapshots -g "^visual: <slug>$"
    corepack pnpm --filter @d-2-g-8/codegen codegen visual <slug> --rendered tests/visual/__screenshots__/linux/<slug>.png
    # inspect visual-result.json + the committed baseline PNG
Or dispatch generate.yml (slug + jobId) and review the opened codegen/<slug> PR:
code + baseline PNG + a "Visual review vs Figma" section + a visual-review label.
```

- [ ] **Step 4: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add docs/design-system-admin/phase3b-visual-contour.md
git commit -m "docs(phase3b): live-smoke preconditions + commands

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Self-Review notes (checked against the spec)

- **Spec coverage:** Part A (CLI `visual` + `figma-image`) → Tasks 1–2; Part B (general Playwright spec + baseline guard) → Task 3; Part C (workflow visual steps) → Task 4; Testing → fixtures per task + Task 5; Preconditions/live-smoke → Task 5.
- **Locked decisions:** advisory/no-fix-loop (`runVisualReview` returns findings; the workflow only labels/annotates, never loops or fails); Default-only (single story id per component); CLI/workflow seam (Playwright step vs `codegen visual`); committed-PNG baseline (`--update-snapshots` in the worker, `add-paths` includes `tests/visual/__screenshots__`, CI's `visual` job compares).
- **Green-everywhere:** `updateSnapshots: 'none'` + the per-test skip-when-no-baseline guard keeps the 3b branch's own CI green (seed Button has no baseline → skipped) while the worker's `--update-snapshots` creates baselines.
- **Generality:** the component list is derived from the manifest + Storybook's story-id rule; no hardcoded names (Task 5 grep).
- **Boundary:** no per-state/all-stories, no visual fix loop, no batch.
- **Dependency:** branches off `phase3a-worker-loop`; 3b's PR follows 3a's merge (Global Constraints).
- **Type consistency:** `runVisualReview` returns `VisualResult { slug, ran, findings: Finding[], model }`; the workflow jq reads `.ran`, `.findings|length`, `.findings[].message`; `reviewVisualDiff` already returns `Finding[]` with a formatted `message`.
```
