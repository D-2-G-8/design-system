# Phase 3a — Worker Loop (Code Contour) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the GitHub Actions worker real — `generate.yml` runs the `codegen` CLI with an in-process validation loop (real `tsc` + deterministic gates + `holisticFix`-until-green), opens/updates a per-component PR, and the admin correlates the job to the run.

**Architecture:** The loop lives in `packages/codegen` (extends Phase 2's write-only `generate`): generate → write → real `tsc --noEmit` over `packages/components` → scope errors to the component + re-run the deterministic gates → `fixComponentFiles` → repeat (cap 3) → write `codegen-result.json`. The workflow wraps that with git + `peter-evans/create-pull-request` (branch `codegen/<slug>`, `needs-human` label on residual findings). The admin resolves a job's run via `run-name` matching and maps run status → job status. The full Storybook build stays on the PR's CI; the visual contour is Phase 3b.

**Tech Stack:** TypeScript 5.9 (ESM), Node 22, `tsx`/`node:test`, `node:child_process` (spawn tsc), GitHub Actions, `peter-evans/create-pull-request@v6`, Next.js (admin), `postgres`.

## Global Constraints

- **Spec:** `design-system/docs/design-system-admin/phase3a-worker-loop.md` — the source of truth; every task's requirements defer to it.
- **Branch:** all work on `phase3a-worker-loop` (off `master`, tip `8968e60`). Commit the spec on this branch (Task 1). NEVER commit to master; NEVER `git add -A` (stage explicit paths).
- **Locked decisions:** (1) gate = real `tsc` over `packages/components` + deterministic gates (A1–A7c); Storybook build stays on CI. (2) fix loop cap = **3 rounds**; on still-red, open the PR anyway labeled `needs-human` with findings. (3) job↔run via `run-name: generate <slug> (job <jobId>)`, admin matches by listing runs. (4) one branch+PR per component `codegen/<slug>`, updated in place. (5) icons = deterministic, **tsc-only**, no `holisticFix`.
- **Reuse Phase-2 exports (do not reimplement):** `generateComponentCodeReviewed`, `fixComponentFiles`, `type ComponentForCodegen`, `type ComponentContract` (`./component`); `runDeterministicGates`, `type ReviewContext`, `type Finding`, `type GeneratedFiles` (`./review`); `buildOwnProps`, `buildComposedProps`, `buildExpectedComposedImports` (`./review/prop-types`, also re-exported from `./component`); `toCssVarName`, `type TokenForCss` (`./tokens`); `componentSourcePaths`, `type GeneratedComponentFiles` (`./paths`); `writeComponent`, `loadTokens`, `loadCommittedContracts`, `type ComponentContractFile` (`./loaders`).
- **Testability:** all side effects (tsc spawn, file writes, generate/fix) are **injected** so the loop is unit-testable with fakes — no network/LLM/child-process in tests.
- **Tooling:** use `corepack pnpm` (bare `pnpm` is v8 and corrupts the lockfile). Typecheck a package with `corepack pnpm --filter <pkg> exec tsc --noEmit`; run fixtures with `corepack pnpm --filter <pkg> exec tsx --test <files>`.
- **Discipline:** everything GENERAL — naming from slug, values from contracts, no per-component/token hardcoding. English only. `cd` into the repo dir every shell call (cwd resets).
- **Out of scope (Phase 3b+):** Playwright/vision/pixel, batch/closure, fine-grained progress callback, admin UI.

## File Structure

```
packages/codegen/src/
  tsc-runner.ts     NEW — parseTscOutput + findingsForComponent (pure) + runPackageTypecheck (spawn)
  validate.ts       NEW — gateComponent + runValidationLoop (injected typecheck/generate/fix/write)
  cli.ts            MODIFY — generate wires the loop + writes codegen-result.json; --max-rounds/--result-file
  index.ts          MODIFY — export the new modules
packages/codegen/test/
  tsc-runner.test.ts   NEW
  validate.test.ts     NEW
.gitignore           MODIFY — ignore codegen-result.json
.github/workflows/generate.yml   MODIFY — real generate + validate + create-PR
apps/admin/lib/
  run-correlation.ts   NEW — pure matchRunByJobId + mapRunToJobStatus
  github.ts            MODIFY — findRunByJobId
apps/admin/app/api/jobs/[id]/route.ts   MODIFY — resolve run + sync status
apps/admin/test/
  run-correlation.test.ts   NEW
apps/admin/package.json   MODIFY — add test script + tsx devDep
```

---

## Task 1: Spec on branch + `tsc-runner.ts` (pure parse/scope + spawn runner)

**Files:**
- Create branch `phase3a-worker-loop`; commit the already-written spec `docs/design-system-admin/phase3a-worker-loop.md`.
- Create: `packages/codegen/src/tsc-runner.ts`
- Test: `packages/codegen/test/tsc-runner.test.ts`

**Interfaces:**
- Produces:
  - `parseTscOutput(raw: string): TscError[]` where `interface TscError { file: string; line: number; message: string }`
  - `findingsForComponent(errors: TscError[], slug: string, isIcon: boolean): { file: string; message: string }[]`
  - `runPackageTypecheck(repoRoot: string): Promise<{ ok: boolean; raw: string }>`

- [ ] **Step 1: Create the branch and commit the spec**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git checkout master && git pull --ff-only
git checkout -b phase3a-worker-loop
git add docs/design-system-admin/phase3a-worker-loop.md
git commit -m "docs(phase3a): worker-loop (code contour) spec

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

- [ ] **Step 2: Write the failing test `packages/codegen/test/tsc-runner.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTscOutput, findingsForComponent } from "../src/tsc-runner";

const SAMPLE = [
  "src/components/button/Button.tsx(12,5): error TS2322: Type 'string' is not assignable to type 'number'.",
  "src/components/button/Button.stories.tsx(4,3): error TS2554: Expected 1 arguments, but got 0.",
  "src/icons/plus/Plus.tsx(3,1): error TS1005: ';' expected.",
  "src/components/chip/Chip.tsx(9,9): error TS2304: Cannot find name 'foo'.",
  "",
].join("\n");

test("parseTscOutput extracts file, line, and the TS message", () => {
  const errs = parseTscOutput(SAMPLE);
  assert.equal(errs.length, 4);
  assert.deepEqual(errs[0], {
    file: "src/components/button/Button.tsx",
    line: 12,
    message: "error TS2322: Type 'string' is not assignable to type 'number'.",
  });
});

test("findingsForComponent scopes to the component's dir and drops siblings", () => {
  const errs = parseTscOutput(SAMPLE);
  const button = findingsForComponent(errs, "button", false);
  assert.equal(button.length, 2); // Button.tsx + Button.stories.tsx, NOT chip, NOT plus
  assert.ok(button.every((f) => f.file.startsWith("src/components/button/")));
});

test("findingsForComponent uses the icons dir when isIcon", () => {
  const errs = parseTscOutput(SAMPLE);
  assert.equal(findingsForComponent(errs, "plus", true).length, 1);
  assert.equal(findingsForComponent(errs, "plus", false).length, 0); // wrong dir → none
});
```

- [ ] **Step 3: Run it to verify it fails**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/tsc-runner.test.ts
```
Expected: FAIL — `Cannot find module '../src/tsc-runner'`.

- [ ] **Step 4: Write `packages/codegen/src/tsc-runner.ts`**

```ts
import { execFile } from "node:child_process";

export interface TscError {
  file: string;
  line: number;
  message: string;
}

// Matches tsc's default pretty=false line: "path(line,col): error TSxxxx: msg".
// tsc runs with cwd = packages/components, so `file` is repo-relative to that
// package (e.g. "src/components/button/Button.tsx").
const TSC_LINE = /^(.+?)\((\d+),\d+\):\s+(error TS\d+:.*)$/;

export function parseTscOutput(raw: string): TscError[] {
  const out: TscError[] = [];
  for (const line of raw.split("\n")) {
    const m = TSC_LINE.exec(line.trim());
    if (m) out.push({ file: m[1], line: Number(m[2]), message: m[3] });
  }
  return out;
}

/** Keep only errors whose file is under this component's own dir; sibling
 *  components' pre-existing errors are not this run's job (CI catches the
 *  whole library). */
export function findingsForComponent(
  errors: TscError[],
  slug: string,
  isIcon: boolean,
): { file: string; message: string }[] {
  const dir = `src/${isIcon ? "icons" : "components"}/${slug}/`;
  return errors.filter((e) => e.file.startsWith(dir)).map((e) => ({ file: e.file, message: e.message }));
}

/** Spawn a real typecheck of the component library. Returns ok=true on exit 0.
 *  tsc writes diagnostics to stdout; we combine stdout+stderr into `raw`. */
export function runPackageTypecheck(repoRoot: string): Promise<{ ok: boolean; raw: string }> {
  return new Promise((resolve) => {
    execFile(
      "corepack",
      ["pnpm", "-F", "@d-2-g-8/design-system", "typecheck"],
      { cwd: repoRoot, maxBuffer: 32 * 1024 * 1024 },
      (err, stdout, stderr) => {
        resolve({ ok: !err, raw: `${stdout ?? ""}\n${stderr ?? ""}` });
      },
    );
  });
}
```

- [ ] **Step 5: Run tests + typecheck**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/tsc-runner.test.ts
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
```
Expected: tests pass (`# fail 0`); `tsc --noEmit` exit 0.

- [ ] **Step 6: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/tsc-runner.ts packages/codegen/test/tsc-runner.test.ts
git commit -m "feat(codegen): tsc-runner (parse + component-scoped findings + spawn)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 2: `validate.ts` — `gateComponent` + `runValidationLoop`

**Files:**
- Create: `packages/codegen/src/validate.ts`
- Test: `packages/codegen/test/validate.test.ts`

**Interfaces:**
- Consumes: `tsc-runner` (Task 1); Phase-2 exports (see Global Constraints).
- Produces:
  - `gateComponent(files: GeneratedFiles, input: GateInput): Finding[]` — assembles the `ReviewContext` and runs `runDeterministicGates`.
  - `runValidationLoop(args: ValidationArgs): Promise<ValidationResult>` where
    `interface ValidationResult { passed: boolean; rounds: number; findings: { file: string; message: string }[]; files: GeneratedFiles }`.
  - Types `GateInput`, `ValidationArgs` (below).

- [ ] **Step 1: Write the failing test `packages/codegen/test/validate.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { runValidationLoop } from "../src/validate";
import type { GeneratedFiles } from "../src/review";

const FILES: GeneratedFiles = { tsx: "x", css: "y", stories: "z", index: "i" };

function baseArgs(overrides: Record<string, unknown> = {}) {
  return {
    model: "test-model",
    component: { slug: "button", name: "Button", variants: [], states: [], isIcon: false, uses: [] } as never,
    contract: { props: [], cssVariables: [], classNames: [] },
    files: FILES,
    tokens: [],
    childContracts: new Map(),
    isIcon: false,
    componentName: "Button",
    fileBase: "Button",
    maxRounds: 3,
    // injected side effects (no network/child-process):
    write: async () => {},
    gate: () => [], // deterministic gates report nothing here
    ...overrides,
  };
}

test("clean first pass → passed, 0 fix rounds", async () => {
  const r = await runValidationLoop(baseArgs({ typecheck: async () => ({ ok: true, raw: "" }) }) as never);
  assert.equal(r.passed, true);
  assert.equal(r.rounds, 0);
});

test("red → fix → green within cap", async () => {
  let calls = 0;
  const r = await runValidationLoop(
    baseArgs({
      typecheck: async () => (calls++ === 0 ? { ok: false, raw: "src/components/button/Button.tsx(1,1): error TS1: bad" } : { ok: true, raw: "" }),
      fix: async (files: GeneratedFiles) => ({ files, inputTokens: 0, outputTokens: 0 }),
    }) as never,
  );
  assert.equal(r.passed, true);
  assert.equal(r.rounds, 1);
});

test("still red after 3 rounds → passed=false with findings", async () => {
  let fixes = 0;
  const r = await runValidationLoop(
    baseArgs({
      typecheck: async () => ({ ok: false, raw: "src/components/button/Button.tsx(1,1): error TS1: bad" }),
      fix: async (files: GeneratedFiles) => { fixes++; return { files, inputTokens: 0, outputTokens: 0 }; },
    }) as never,
  );
  assert.equal(r.passed, false);
  assert.equal(r.rounds, 3);
  assert.equal(fixes, 3);
  assert.ok(r.findings.length >= 1);
});

test("icon path is tsc-only: no fix call even when red", async () => {
  let fixes = 0;
  const r = await runValidationLoop(
    baseArgs({
      isIcon: true,
      component: { slug: "plus", name: "Plus", variants: [], states: [], isIcon: true, uses: [] },
      componentName: "Plus", fileBase: "Plus",
      typecheck: async () => ({ ok: false, raw: "src/icons/plus/Plus.tsx(1,1): error TS1: bad" }),
      fix: async (files: GeneratedFiles) => { fixes++; return { files, inputTokens: 0, outputTokens: 0 }; },
    }) as never,
  );
  assert.equal(r.passed, false);
  assert.equal(fixes, 0); // never fixes an icon
  assert.ok(r.findings.length >= 1);
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/validate.test.ts
```
Expected: FAIL — `Cannot find module '../src/validate'`.

- [ ] **Step 3: Write `packages/codegen/src/validate.ts`**

```ts
import { runDeterministicGates } from "./review";
import type { GeneratedFiles, Finding, ReviewContext } from "./review";
import { buildOwnProps, buildComposedProps, buildExpectedComposedImports } from "./review/prop-types";
import { toCssVarName, type TokenForCss } from "./tokens";
import type { ComponentContract, ComponentForCodegen } from "./component";
import { findingsForComponent, parseTscOutput } from "./tsc-runner";
import type { StoredComponentContract } from "./types";

export interface GateInput {
  componentName: string;
  fileBase: string;
  contract: ComponentContract;
  tokens: TokenForCss[];
  uses: { slug: string; componentName: string; isIcon: boolean }[];
  childContracts: Map<string, StoredComponentContract>;
}

/** Assemble the ReviewContext (same pieces generateComponentCodeReviewed uses)
 *  and run the deterministic gates over the written files. Re-run each round to
 *  catch a holisticFix that reintroduced a gate violation. */
export function gateComponent(files: GeneratedFiles, input: GateInput): Finding[] {
  const ctx: ReviewContext = {
    componentName: input.componentName,
    fileBase: input.fileBase,
    tokenVarNames: new Set(input.tokens.map((t) => toCssVarName(t.name))),
    ownProps: buildOwnProps(input.contract),
    composedProps: buildComposedProps(input.uses, input.childContracts),
    expectedComposedImports: buildExpectedComposedImports(input.uses, false),
  };
  return runDeterministicGates(files, ctx);
}

export interface ValidationArgs extends GateInput {
  model: string;
  component: ComponentForCodegen;
  files: GeneratedFiles;
  isIcon: boolean;
  maxRounds?: number;
  // Injected side effects (real ones in the CLI; fakes in tests):
  typecheck: () => Promise<{ ok: boolean; raw: string }>;
  write: (files: GeneratedFiles) => Promise<void>;
  fix: (files: GeneratedFiles, findings: { file: string; message: string }[]) => Promise<{ files: GeneratedFiles; inputTokens: number; outputTokens: number }>;
  // Optional override for the deterministic gate (tests inject a stub); defaults to gateComponent.
  gate?: (files: GeneratedFiles) => Finding[];
}

export interface ValidationResult {
  passed: boolean;
  rounds: number;
  findings: { file: string; message: string }[];
  files: GeneratedFiles;
}

export async function runValidationLoop(args: ValidationArgs): Promise<ValidationResult> {
  const maxRounds = args.maxRounds ?? 3;
  const gate = args.gate ?? ((f: GeneratedFiles) => gateComponent(f, args));
  let files = args.files;
  let rounds = 0;

  for (;;) {
    await args.write(files);
    const tsc = await args.typecheck();
    const tscFindings = tsc.ok
      ? []
      : findingsForComponent(parseTscOutput(tsc.raw), args.component.slug, args.isIcon);
    const gateFindings = gate(files)
      .filter((f) => f.severity === "build-breaking")
      .map((f) => ({ file: f.file, message: f.message }));
    const findings = [...tscFindings, ...gateFindings];

    if (findings.length === 0) return { passed: true, rounds, findings: [], files };
    // Icons are deterministic — no LLM fix; report and stop.
    if (args.isIcon) return { passed: false, rounds, findings, files };
    if (rounds >= maxRounds) return { passed: false, rounds, findings, files };

    const fixed = await args.fix(files, findings);
    files = fixed.files;
    rounds++;
  }
}
```

- [ ] **Step 4: Run tests + typecheck**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/validate.test.ts
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
```
Expected: 4/4 pass; `tsc --noEmit` exit 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/validate.ts packages/codegen/test/validate.test.ts
git commit -m "feat(codegen): gateComponent + runValidationLoop (injected tsc/write/fix, cap 3, icon tsc-only)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 3: Wire `cli.ts generate` into the loop + `codegen-result.json`

**Files:**
- Modify: `packages/codegen/src/cli.ts`
- Modify: `packages/codegen/src/index.ts` (export the new modules)
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `runValidationLoop` (Task 2), `runPackageTypecheck` (Task 1), Phase-2 exports.
- Produces: `generate` now runs the loop and writes `codegen-result.json` = `{ slug, isIcon, passed, rounds, findings, model }`. New flags `--max-rounds <n>` / `--result-file <path>`. Exit 0 on clean or needs-human; non-zero only on hard error.

- [ ] **Step 1: Add the `codegen-result.json` writer + a GeneratedFiles→source helper, and wire the non-icon branch**

Edit `packages/codegen/src/cli.ts`. Add imports:
```ts
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { componentSourcePaths, type GeneratedComponentFiles } from "./paths";
import { fixComponentFiles } from "./component";
import { runPackageTypecheck } from "./tsc-runner";
import { runValidationLoop } from "./validate";
import type { GeneratedFiles } from "./review";
```

Add a helper (before `generate`):
```ts
interface CodegenResult {
  slug: string;
  isIcon: boolean;
  passed: boolean;
  rounds: number;
  findings: { file: string; message: string }[];
  model: string;
}

function writeResult(root: string, resultFile: string | undefined, r: CodegenResult): void {
  const path = resultFile ?? join(root, "codegen-result.json");
  writeFileSync(path, JSON.stringify(r, null, 2) + "\n");
  console.log(`result → ${path} (passed=${r.passed}, rounds=${r.rounds}, findings=${r.findings.length})`);
}

/** Rebuild the path-carrying GeneratedComponentFiles from a fixed GeneratedFiles
 *  (contract/deletePaths/costs preserved from the initial generation). */
function toSource(
  slug: string,
  isIcon: boolean,
  files: GeneratedFiles,
  base: GeneratedComponentFiles,
): GeneratedComponentFiles {
  const p = componentSourcePaths(slug, isIcon);
  return {
    ...base,
    componentName: p.componentName,
    tsxPath: p.tsxPath, tsxContent: files.tsx,
    cssPath: p.cssPath, cssContent: files.css,
    storiesPath: p.storiesPath, storiesContent: files.stories,
    indexPath: p.indexPath, indexContent: files.index,
  };
}
```

Replace the non-icon tail of `generate` (from `const reviewed = ...` through `return reviewed.reviewPassed ? 0 : 2;`) with:
```ts
  const reviewed = await generateComponentCodeReviewed(model, component, tokens, childContracts);
  const contractFile: ComponentContractFile = {
    name, slug, isIcon: false, figmaNodeIds,
    variants: component.variants, states: component.states,
    contract: reviewed.contract,
  };

  const result = await runValidationLoop({
    model,
    component,
    contract: reviewed.contract,
    files: { tsx: reviewed.tsxContent, css: reviewed.cssContent, stories: reviewed.storiesContent, index: reviewed.indexContent },
    tokens,
    childContracts,
    isIcon: false,
    componentName: reviewed.componentName,
    fileBase: reviewed.componentName,
    uses: component.uses ?? [],
    maxRounds,
    typecheck: () => runPackageTypecheck(root),
    write: async (files) => { writeComponent(contractFile, toSource(slug, false, files, reviewed), root); },
    fix: (files, findings) => fixComponentFiles(model, component, reviewed.contract, files, findings, childContracts, tokens),
  });

  writeResult(root, resultFile, { slug, isIcon: false, passed: result.passed, rounds: result.rounds, findings: result.findings, model });
  return 0; // the workflow opens the PR; the label carries needs-human
```

Note: `reviewed.componentName` is `GeneratedComponentFiles.componentName` (== `componentIdentifier(slug)`, the file base). `maxRounds`/`resultFile` come from the new flags (Step 3).

- [ ] **Step 2: Wire the icon branch (tsc-only) to also validate + write result**

Replace the icon branch's `const written = writeComponent(...); console.log(...); return 0;` tail with:
```ts
    const contractFile: ComponentContractFile = {
      name, slug, isIcon: true, figmaNodeIds,
      variants: existing?.variants ?? [], states: existing?.states ?? [],
      contract: { props: [], cssVariables: [], classNames: [] },
    };
    const result = await runValidationLoop({
      model: getCodegenModel(),
      component: { slug, name, variants: contractFile.variants, states: contractFile.states, isIcon: true, uses: [] },
      contract: contractFile.contract,
      files: { tsx: files.tsxContent, css: files.cssContent, stories: files.storiesContent, index: files.indexContent },
      tokens: loadTokens(root),
      childContracts: new Map(),
      isIcon: true,
      componentName: files.componentName,
      fileBase: files.componentName,
      uses: [],
      typecheck: () => runPackageTypecheck(root),
      write: async (f) => { writeComponent(contractFile, toSource(slug, true, f, files), root); },
      fix: async (f) => ({ files: f, inputTokens: 0, outputTokens: 0 }), // never called for icons
    });
    writeResult(root, resultFile, { slug, isIcon: true, passed: result.passed, rounds: result.rounds, findings: result.findings, model: getCodegenModel() });
    return 0;
```

- [ ] **Step 3: Parse the new flags in `main`/`generate`**

In `main`'s `generate` branch, parse `--max-rounds` and `--result-file` and pass them through. Change the `generate` signature to `generate(slug, forceIcon, opts: { maxRounds: number; resultFile?: string })` and thread `const maxRounds = opts.maxRounds; const resultFile = opts.resultFile;` at the top of `generate`. In `main`:
```ts
  if (cmd === "generate") {
    const rest = argv.slice(1);
    const slug = rest.find((a) => !a.startsWith("-"));
    if (!slug) { console.error("generate needs a <slug>. See `codegen --help`."); return 1; }
    const mrIdx = rest.indexOf("--max-rounds");
    const maxRounds = mrIdx >= 0 ? Number(rest[mrIdx + 1]) : 3;
    const rfIdx = rest.indexOf("--result-file");
    const resultFile = rfIdx >= 0 ? rest[rfIdx + 1] : undefined;
    return generate(slug, rest.includes("--icon"), { maxRounds, resultFile });
  }
```
Update the `HELP` string to document `--max-rounds`/`--result-file` and note that `generate` now typechecks + fixes (cap 3) and writes `codegen-result.json`.

- [ ] **Step 4: Export the new modules in `index.ts`**

Append to `packages/codegen/src/index.ts`:
```ts
export * from "./tsc-runner";
export * from "./validate";
```
If tsc reports a duplicate-export (TS2308), switch that line to explicit named re-exports.

- [ ] **Step 5: Ignore the result file**

Append to `.gitignore`:
```
# codegen run result (read by the generate workflow; never committed)
codegen-result.json
```

- [ ] **Step 6: Typecheck, run all fixtures, and a no-env dry check**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
corepack pnpm --filter @d-2-g-8/codegen test
env -u FIGMA_ACCESS_TOKEN -u ANTHROPIC_API_KEY corepack pnpm --filter @d-2-g-8/codegen exec tsx src/cli.ts --help
```
Expected: `tsc --noEmit` exit 0; all fixtures (tsc-runner, validate, + Phase-2 suite) pass; `--help` prints the updated usage with `--max-rounds`/`--result-file`. Do NOT run a live `generate` (needs Figma+Anthropic).

- [ ] **Step 7: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/cli.ts packages/codegen/src/index.ts .gitignore
git commit -m "feat(codegen): generate runs the in-process validation loop + writes codegen-result.json

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 4: `generate.yml` — real generate + validate + create-PR

**Files:**
- Modify: `.github/workflows/generate.yml`

**Interfaces:**
- Consumes: `codegen generate` + `codegen-result.json` (Task 3). Produces: a per-component PR (`codegen/<slug>`), labeled `needs-human` on residual findings; the run named `generate <slug> (job <jobId>)`.

- [ ] **Step 1: Rewrite `generate.yml`**

Replace the placeholder step. Keep `on.workflow_dispatch.inputs` (slug, jobId) and the `concurrency` group. Add `run-name`, `permissions`, and the real steps:

```yaml
name: Generate Component
run-name: "generate ${{ inputs.slug }} (job ${{ inputs.jobId }})"

on:
  workflow_dispatch:
    inputs:
      slug:
        description: "Component slug to generate (e.g. button, dialog)"
        required: true
        type: string
      jobId:
        description: "Job id from the admin app's Postgres job store"
        required: true
        type: string

permissions:
  contents: write
  pull-requests: write

concurrency:
  group: generate-${{ inputs.slug }}

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile

      - name: Generate + validate
        env:
          SLUG: ${{ inputs.slug }}
          FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: corepack pnpm --filter @d-2-g-8/codegen codegen generate "$SLUG"

      - name: Read result
        id: result
        run: |
          PASSED=$(jq -r '.passed' codegen-result.json)
          ROUNDS=$(jq -r '.rounds' codegen-result.json)
          echo "passed=$PASSED" >> "$GITHUB_OUTPUT"
          {
            echo "body<<RESULT_EOF"
            echo "Generated \`$SLUG\` via the codegen worker (fix rounds: $ROUNDS)."
            if [ "$PASSED" != "true" ]; then
              echo ""
              echo "**Unresolved after the fix loop — needs a human:**"
              jq -r '.findings[] | "- `\(.file)` — \(.message)"' codegen-result.json
            fi
            echo "RESULT_EOF"
          } >> "$GITHUB_OUTPUT"

      - name: Open/update PR
        uses: peter-evans/create-pull-request@v6
        with:
          branch: codegen/${{ inputs.slug }}
          base: master
          title: "codegen: ${{ inputs.slug }}"
          body: ${{ steps.result.outputs.body }}
          labels: ${{ steps.result.outputs.passed == 'true' && '' || 'needs-human' }}
          add-paths: packages/components
          commit-message: "codegen: generate ${{ inputs.slug }}"
```

Notes: `SLUG` is passed via env (injection-safe, per the skeleton). `FIGMA_FILE_KEY` is omitted (the manifest's `figmaFileKey` is used); add it as an env line only if a per-run override is needed. `codegen-result.json` is gitignored, and `add-paths: packages/components` scopes the commit, so it's never committed. peter-evans uses the default `GITHUB_TOKEN` — the repo/org setting "Allow GitHub Actions to create and approve pull requests" must be enabled (see the spec's preconditions).

- [ ] **Step 2: Static-lint the workflow (best-effort) and sanity-check YAML**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
command -v actionlint >/dev/null && actionlint .github/workflows/generate.yml || echo "actionlint not installed — skipping (careful diff review instead)"
python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/generate.yml')); print('YAML parses OK')"
```
Expected: `actionlint` clean if present; YAML parses. (A live dispatch is the user-gated smoke, Task 6.)

- [ ] **Step 3: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add .github/workflows/generate.yml
git commit -m "feat(worker): generate.yml runs codegen + opens a per-component PR (needs-human on findings)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 5: Admin job↔run correlation

**Files:**
- Create: `apps/admin/lib/run-correlation.ts`
- Modify: `apps/admin/lib/github.ts`
- Modify: `apps/admin/app/api/jobs/[id]/route.ts`
- Modify: `apps/admin/package.json` (test script + `tsx` devDep)
- Test: `apps/admin/test/run-correlation.test.ts`

**Interfaces:**
- Produces (pure, testable):
  - `matchRunByJobId(runs: { id: number; name: string | null }[], jobId: string): { id: number; name: string | null } | null`
  - `mapRunToJobStatus(run: { status: string | null; conclusion: string | null }): JobStatus`
- Produces (`github.ts`): `findRunByJobId(jobId: string): Promise<WorkflowRun | null>`.

- [ ] **Step 1: Write the failing test `apps/admin/test/run-correlation.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { matchRunByJobId, mapRunToJobStatus } from "../lib/run-correlation";

test("matchRunByJobId finds the run whose name carries the jobId", () => {
  const runs = [
    { id: 1, name: "generate button (job abc-123)" },
    { id: 2, name: "generate chip (job def-456)" },
  ];
  assert.equal(matchRunByJobId(runs, "def-456")?.id, 2);
  assert.equal(matchRunByJobId(runs, "zzz-000"), null);
  assert.equal(matchRunByJobId([{ id: 3, name: null }], "abc"), null);
});

test("mapRunToJobStatus maps run status/conclusion to a job status", () => {
  assert.equal(mapRunToJobStatus({ status: "in_progress", conclusion: null }), "running");
  assert.equal(mapRunToJobStatus({ status: "queued", conclusion: null }), "running");
  assert.equal(mapRunToJobStatus({ status: "completed", conclusion: "success" }), "done");
  assert.equal(mapRunToJobStatus({ status: "completed", conclusion: "failure" }), "failed");
  assert.equal(mapRunToJobStatus({ status: "completed", conclusion: "cancelled" }), "failed");
});
```

- [ ] **Step 2: Add a test script + tsx to `apps/admin/package.json`**

Add to `scripts`: `"test": "tsx --test test/*.test.ts"`. Add to `devDependencies`: `"tsx": "^4.19.2"`. Then:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm install
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsx --test test/run-correlation.test.ts
```
Expected: install adds tsx (lockfile stays v9); test FAILS — `Cannot find module '../lib/run-correlation'`.

- [ ] **Step 3: Write `apps/admin/lib/run-correlation.ts`**

```ts
import type { JobStatus } from "./jobs";

/** Find the workflow run whose run-name carries this jobId
 *  ("generate <slug> (job <jobId>)"). Null when it hasn't appeared yet. */
export function matchRunByJobId<T extends { name: string | null }>(runs: T[], jobId: string): T | null {
  const needle = `(job ${jobId})`;
  return runs.find((r) => r.name?.includes(needle)) ?? null;
}

/** Map a GitHub run's status/conclusion to our coarse job status. The
 *  needs-human nuance lives on the PR label, not here. */
export function mapRunToJobStatus(run: { status: string | null; conclusion: string | null }): JobStatus {
  if (run.status !== "completed") return "running";
  return run.conclusion === "success" ? "done" : "failed";
}
```

- [ ] **Step 4: Add `findRunByJobId` to `apps/admin/lib/github.ts`**

Add (reusing `githubFetch`/`getConfig`, and `matchRunByJobId`):
```ts
import { matchRunByJobId } from "./run-correlation";

/** Lists recent generate.yml runs and returns the one whose run-name carries
 *  `jobId` (workflow_dispatch doesn't return a run id, so we correlate by name).
 *  Null if it hasn't appeared yet. */
export async function findRunByJobId(jobId: string): Promise<WorkflowRun | null> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/actions/workflows/generate.yml/runs?per_page=50`);
  if (!res.ok) {
    throw new Error(`Failed to list generate.yml runs: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { workflow_runs: (WorkflowRun & { name: string | null })[] };
  const match = matchRunByJobId(data.workflow_runs ?? [], jobId);
  return match ? { id: match.id, status: match.status, conclusion: match.conclusion, html_url: match.html_url } : null;
}
```
(If `WorkflowRun` lacks fields the cast needs, keep it minimal — the runs list returns `id`, `name`, `status`, `conclusion`, `html_url`.)

- [ ] **Step 5: Sync status in `GET /api/jobs/[id]`**

Modify `apps/admin/app/api/jobs/[id]/route.ts`: after `get(id)`, resolve + sync the run. Imports: add `findRunByJobId` and `setStatus`, `mapRunToJobStatus`.
```ts
    let run: unknown = null;
    let runId = job.workflow_run_id;
    if (!runId) {
      try {
        const found = await findRunByJobId(id);
        if (found) { runId = String(found.id); await setStatus(id, mapRunToJobStatus(found), { workflow_run_id: runId }); run = found; }
      } catch (e) { run = { error: e instanceof Error ? e.message : String(e) }; }
    }
    if (runId && !run) {
      try {
        const fetched = await getWorkflowRun(runId);
        await setStatus(id, mapRunToJobStatus(fetched));
        run = fetched;
      } catch (e) { run = { error: e instanceof Error ? e.message : String(e) }; }
    }
    const fresh = (await get(id)) ?? job;
    return NextResponse.json({ ok: true, job: fresh, run });
```
Keep the existing outer try/catch (never 500 on a GitHub outage — the job row stays authoritative).

- [ ] **Step 6: Test, typecheck, admin build**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsx --test test/run-correlation.test.ts
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsc --noEmit
corepack pnpm -F @d-2-g-8/design-system-admin build
```
Expected: 2/2 pass; `tsc --noEmit` exit 0; the admin `next build` succeeds with no env (lazy env, per Phase 1).

- [ ] **Step 7: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/lib/run-correlation.ts apps/admin/lib/github.ts apps/admin/app/api/jobs/\[id\]/route.ts apps/admin/package.json apps/admin/test/run-correlation.test.ts pnpm-lock.yaml
git commit -m "feat(admin): correlate job to run via run-name + sync job status from the run

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 6: Full verify + document the live smoke

**Files:**
- Modify: `docs/design-system-admin/phase3a-worker-loop.md` (append a "Live smoke (user-gated)" note if not already precise).

**Interfaces:** none new — verification + docs.

- [ ] **Step 1: Full monorepo verification**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm install
corepack pnpm -r typecheck
corepack pnpm --filter @d-2-g-8/codegen test
corepack pnpm --filter @d-2-g-8/design-system-admin test
corepack pnpm --filter @d-2-g-8/codegen build
corepack pnpm -F @d-2-g-8/design-system-admin build
corepack pnpm -F @d-2-g-8/design-system build          # library unaffected
grep -m1 lockfileVersion pnpm-lock.yaml                 # must stay '9.0'
```
Expected: `pnpm -r typecheck` green across all packages; codegen fixtures + admin fixtures pass; codegen tsup build + admin build + library build succeed; lockfile v9.

- [ ] **Step 2: Confirm generality + no accidental cross-repo edits**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
! grep -rnE "slug\s*===|=== *['\"](button|chip|avatar)" packages/codegen/src apps/admin/lib && echo "GENERAL: no per-component branching"
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app && git status --porcelain
```
Expected: prints `GENERAL: ...`; `ai-tools-app` working tree empty (untouched).

- [ ] **Step 3: Document the live smoke in the spec**

Ensure the spec's "Preconditions for a live run" section is accurate, and add the exact dispatch command for the user-gated smoke (do NOT run it):
```markdown
### Live smoke (user-gated — costs Figma + Anthropic)
Preconditions: repo Actions secrets FIGMA_ACCESS_TOKEN + ANTHROPIC_API_KEY set;
"Allow GitHub Actions to create and approve pull requests" enabled; a manifest
component with real figmaNodeIds (the seed Button has none → label-only). Then,
from the repo checkout with the two env vars set:
    corepack pnpm --filter @d-2-g-8/codegen codegen generate <slug>
    # inspect codegen-result.json + the written files under packages/components
Or dispatch the workflow from the Actions tab (slug + a jobId) and watch it open
codegen/<slug> PR; the admin's GET /api/jobs/<jobId> then reflects the run status.
```

- [ ] **Step 4: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add docs/design-system-admin/phase3a-worker-loop.md
git commit -m "docs(phase3a): live-smoke preconditions + command

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Self-Review notes (checked against the spec)

- **Spec coverage:** Part A (CLI loop) → Tasks 1–3; Part B (workflow) → Task 4; Part C (admin correlation) → Task 5; Testing → fixtures in each task + Task 6 verify; Preconditions/live-smoke → Task 6 doc.
- **Locked decisions:** gate = tsc + deterministic (Task 2 `runValidationLoop`); Storybook build NOT in the worker (only CI); cap 3 + open-PR-anyway (Task 2 return + Task 4 label); run-name correlation (Task 4 `run-name` + Task 5 `matchRunByJobId`); per-component branch (Task 4 `branch: codegen/<slug>`); icons tsc-only (Task 2 `isIcon` short-circuit, Task 3 icon branch).
- **Generality:** naming from slug (`componentSourcePaths`), values from contracts (`gateComponent`/`fixComponentFiles`), tokens from `tokens.json`; no per-component branches (Task 6 grep).
- **Boundary:** no Playwright/vision/pixel; no batch; no callback progress — all explicitly Phase 3b+.
- **Type consistency:** `runValidationLoop` consumes/returns `GeneratedFiles` ({tsx,css,stories,index}); `toSource` bridges to `GeneratedComponentFiles` for `writeComponent`; `fixComponentFiles` returns `GeneratedFiles`. `mapRunToJobStatus` returns `JobStatus` ("queued"|"running"|"done"|"failed").
```
