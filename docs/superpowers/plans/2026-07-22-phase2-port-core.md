# Phase 2 — Port the Codegen Core into `packages/codegen` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the reusable design-system codegen logic OUT of `ai-tools-app` (serverless / DB / GitHub-API-bound) INTO a new `packages/codegen` workspace package in the `design-system` monorepo — file-based (git = state) and client-based (single service tokens), runnable as a `codegen` CLI that the Phase 3 GitHub Actions worker will invoke.

**Architecture:** The port keeps every module's names and logic byte-for-byte identical to the `ai-tools-app` source, changing only the *edges*: strip `import "server-only"`; swap the multi-tenant Anthropic/Figma clients for single-token equivalents (`ANTHROPIC_API_KEY` / `FIGMA_ACCESS_TOKEN`); replace Drizzle DB loaders with file loaders that read `design-system.manifest.json`, `tokens/tokens.json`, and each component's `<slug>.contract.json`; and replace `@/db/schema` types with a local `types.ts`. The Phase 2 CLI does **distill → generate → write files** only — NO validation loop (real tsc / Storybook / Playwright / vision) and NO git/PR (those are Phase 3).

**Tech Stack:** TypeScript 5.9 (ESM), Node 22, the `ai` SDK v7 (`generateObject`/`generateText`) with `@ai-sdk/anthropic`, `zod` v4, `tsup` (build → `dist`), `tsx` (dev/tests), Node's built-in `node:test` runner.

## Global Constraints

- **Package name:** `@d-2-g-8/codegen` (matches the `@d-2-g-8/*` scope; the library package is `@d-2-g-8/design-system`).
- **Location:** `packages/codegen/` — auto-included by the root `pnpm-workspace.yaml` glob `packages/*`.
- **TypeScript:** `^5.9.3`. Node: `22`. ESM only (`"type": "module"`). `packageManager: pnpm@10.18.0`.
- **Runtime deps (exact versions, copied from ai-tools-app):** `ai@^7.0.31`, `@ai-sdk/anthropic@^4.0.16`, `zod@^4.4.3`.
- **Dev deps:** `typescript@^5.9.3`, `@types/node@^22.10.0`, `tsx@^4.19.2`, `tsup@^8.3.5`.
- **English only** — all code, comments, string literals, docs (per `ai-tools-app/CLAUDE.md`, carries to this repo).
- **Everything GENERAL — no per-component rules.** Naming derives from the slug, values from contracts, tokens from `tokens.json`. NEVER special-case a component/icon/token by name or hardcoded value. (Both repos' CLAUDE.md.)
- **COPY, do not delete from `ai-tools-app`.** Cutover (retiring the old modules) is Phase 6. The old design-system tool keeps working.
- **Port fidelity:** keep every ported module's exported names, signatures, and internal logic identical. Change only: `server-only` (strip), client imports (swap), DB reads (→ loaders), `@/db/schema` types (→ `./types`), `@/lib/models` (→ `./models`).
- **No `bin`/dist assumptions at runtime for tests:** tests and the CLI verification run via `tsx` on source; `tsup` produces `dist/cli.js` for the real `bin`.
- **Commits:** need explicit user OK. Once the user approves this SDD run, feature-branch commits on `phase2-port-core` are fine; NEVER commit to `master`/`main`; NEVER `git add -A` / `git add .` (stage explicit paths). Keep the SDD ledger in the session scratchpad, not the repo.
- **cwd resets between shells** — every Bash step must `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system` (or the package dir) explicitly.
- **Branch:** all work on `phase2-port-core` (off `master`). Create it in Task 1.

## Source of truth (port FROM)

`ai-tools-app/src/lib/design-system-codegen/` on branch `master` (tip `030ccff` — has every codegen-fixes merge). Plus `ai-tools-app/src/lib/figma/client.ts`, `src/lib/llm/client.ts`, `src/lib/models.ts`. Absolute prefix used below: `AT = /Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app`.

## Target File Structure (`packages/codegen/`)

```
packages/codegen/
  package.json            name @d-2-g-8/codegen, type module, bin, scripts (typecheck/build/test)
  tsconfig.json           ES2022 / ESNext / Bundler resolution, noEmit-friendly
  tsup.config.ts          build cli.ts + index.ts → dist (esm, shebang banner on cli)
  README.md               what the package is + how the CLI runs (Task 6)
  src/
    types.ts              NEW — local port of @/db/schema types (no drizzle)
    models.ts             NEW — ModelInfo catalog + DEFAULT_MODEL_ID + estimateCostUsd
    anthropic.ts          NEW — single-token getAnthropicClient() + getCodegenModel()
    figma.ts              PORT of figma/client.ts — single-token (FIGMA_ACCESS_TOKEN PAT)
    loaders.ts            NEW — file loaders replacing data.ts + writeComponent
    tokens.ts             PORT (strip server-only; DesignTokenCategory ← ./types)
    paths.ts              PORT (verbatim)
    checks.ts             PORT (verbatim)
    icon.ts               PORT (verbatim)
    icon-fetch.ts         PORT (swap @/lib/figma/client → ./figma; strip server-only)
    figma-node.ts         PORT (swap getFileNodes → ./figma; strip server-only)
    dependencies.ts       PORT (swap getFileNodes → ./figma; componentIdentifier ← ./paths; strip server-only)
    component.ts          PORT (swap getAnthropicClient→./anthropic, estimateCostUsd→./models, schema types→./types; strip server-only)
    token-derive.ts       PORT (rows-in/tokens-out refactor; swap figma client; strip server-only + DB)
    visual-diff.ts        PORT (swap getAnthropicClient → ./anthropic; strip server-only)
    review/
      types.ts            PORT (verbatim)
      prop-types.ts       PORT (verbatim)
      deterministic.ts    PORT (verbatim)
      reviewer.ts         PORT (swap getAnthropicClient → ../anthropic; strip server-only)
      index.ts            PORT (strip server-only)
    cli.ts                NEW — generate / doctor / --help
  test/
    paths.test.ts         NEW fixtures (pure)
    prop-types.test.ts    NEW fixtures (pure)
    deterministic.test.ts NEW fixtures (value gates)
    loaders.test.ts       NEW fixtures (temp dir)
  index.ts                NEW — public API barrel (re-exports for programmatic use)
```

Note: `src/index.ts` (package barrel) is distinct from `src/review/index.ts` (the review orchestrator). Both exist.

---

## Task 1: Package scaffold + local types + models + clients

Stand up the package with its config and the three leaf modules that have NO local dependencies: `types.ts`, `models.ts`, `anthropic.ts`, `figma.ts`. These compile on their own and unblock every later port.

**Files:**
- Create branch: `phase2-port-core`
- Create: `packages/codegen/package.json`
- Create: `packages/codegen/tsconfig.json`
- Create: `packages/codegen/tsup.config.ts`
- Create: `packages/codegen/src/types.ts`
- Create: `packages/codegen/src/models.ts`
- Create: `packages/codegen/src/anthropic.ts`
- Create: `packages/codegen/src/figma.ts`
- Test: `packages/codegen/test/paths.test.ts` is Task 2; this task's deliverable is verified by `tsc --noEmit`.

**Interfaces:**
- Produces: `src/types.ts` → `DesignTokenCategory`, `DesignComponentVariant`, `DesignComponentState`, `StoredComponentContract`, `designTokenCategoryValues`.
- Produces: `src/models.ts` → `ModelInfo`, `AVAILABLE_MODELS`, `DEFAULT_MODEL_ID`, `getModelInfo(id)`, `estimateCostUsd(id, inTok, outTok)`.
- Produces: `src/anthropic.ts` → `getAnthropicClient()` (returns the `createAnthropic` factory; callers do `(await getAnthropicClient())(model)`), `getCodegenModel()`.
- Produces: `src/figma.ts` → `describeFigmaError`, `getFigmaAccessToken()`, `figmaGet`, `getFileNodes`, `getFileNodesShallow`, `getFileImages`, `FIGMA_FILE_FETCH_TIMEOUT_MS`.

- [ ] **Step 1: Create the branch**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git checkout master && git pull --ff-only
git checkout -b phase2-port-core
```

- [ ] **Step 2: Write `packages/codegen/package.json`**

```json
{
  "name": "@d-2-g-8/codegen",
  "version": "0.1.0",
  "description": "Design-system codegen core: distill Figma designs and generate React + SCSS + Storybook code. Runs as a CLI invoked by the GitHub Actions generate worker.",
  "private": true,
  "type": "module",
  "bin": {
    "codegen": "./dist/cli.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "test": "tsx --test test/*.test.ts",
    "codegen": "tsx src/cli.ts"
  },
  "dependencies": {
    "@ai-sdk/anthropic": "^4.0.16",
    "ai": "^7.0.31",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "tsup": "^8.3.5",
    "tsx": "^4.19.2",
    "typescript": "^5.9.3"
  },
  "packageManager": "pnpm@10.18.0"
}
```

- [ ] **Step 3: Write `packages/codegen/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "declaration": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["node"]
  },
  "include": ["src", "test", "tsup.config.ts"]
}
```

- [ ] **Step 4: Write `packages/codegen/tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/cli.ts"],
  format: ["esm"],
  target: "node22",
  dts: true,
  clean: true,
  // The CLI is executed directly (bin) -- give it a node shebang.
  banner: ({ format }) => (format === "esm" ? { js: "#!/usr/bin/env node" } : {}),
});
```

- [ ] **Step 5: Write `packages/codegen/src/types.ts`**

```ts
// Local port of the shapes that used to live in ai-tools-app's @/db/schema.
// State is files now (see docs/design-system-admin/conventions.md), so these
// are plain TS types -- no drizzle tables, no DB coupling.

export const designTokenCategoryValues = [
  "color",
  "typography",
  "spacing",
  "radius",
  "shadow",
  "duration",
  "other",
] as const;
export type DesignTokenCategory = (typeof designTokenCategoryValues)[number];

export interface DesignComponentVariant {
  name: string;
  description?: string;
}

export interface DesignComponentState {
  name: string;
  description?: string;
}

/**
 * The generated component's API contract (props + tokens + class names),
 * persisted next to the component as <slug>.contract.json so a DEPENDENT
 * component's codegen/review can validate the values it passes to this one
 * (and so the self gate can validate this component's own stories). Only
 * `props[].{name,type}` is read by the gates.
 */
export interface StoredComponentContract {
  props: { name: string; type: string; description?: string }[];
  cssVariables?: string[];
  classNames?: string[];
}
```

- [ ] **Step 6: Write `packages/codegen/src/models.ts`**

```ts
// Model catalog + cost estimation, ported from ai-tools-app/src/lib/models.ts
// (trimmed to what codegen needs). Prices are $ per 1M tokens.

export interface ModelInfo {
  id: string;
  label: string;
  provider: "anthropic";
  inputPricePerMTok: number;
  outputPricePerMTok: number;
  isDefault?: boolean;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  { id: "claude-sonnet-4-5", label: "Claude Sonnet (default)", provider: "anthropic", inputPricePerMTok: 2, outputPricePerMTok: 10, isDefault: true },
  { id: "claude-haiku-4-5", label: "Claude Haiku (faster and cheaper)", provider: "anthropic", inputPricePerMTok: 1, outputPricePerMTok: 5 },
  { id: "claude-opus-4-5", label: "Claude Opus (maximum quality)", provider: "anthropic", inputPricePerMTok: 5, outputPricePerMTok: 25 },
];

export const DEFAULT_MODEL_ID = AVAILABLE_MODELS.find((m) => m.isDefault)!.id;

export function getModelInfo(modelId: string): ModelInfo {
  return AVAILABLE_MODELS.find((m) => m.id === modelId) ?? AVAILABLE_MODELS[0];
}

export function estimateCostUsd(modelId: string, inputTokens: number, outputTokens: number): number {
  const model = getModelInfo(modelId);
  return (inputTokens / 1_000_000) * model.inputPricePerMTok + (outputTokens / 1_000_000) * model.outputPricePerMTok;
}
```

- [ ] **Step 7: Write `packages/codegen/src/anthropic.ts`**

```ts
import { createAnthropic } from "@ai-sdk/anthropic";
import { DEFAULT_MODEL_ID } from "./models";

/**
 * Single-service-token Anthropic client for the codegen package. The platform's
 * per-session / multi-tenant token handling was its job -- here one service
 * token (ANTHROPIC_API_KEY, from the Actions secret) drives every call, with an
 * optional ANTHROPIC_BASE_URL to route through a proxy/gateway.
 *
 * Kept callable as `await getAnthropicClient()` so the ported modules
 * (reviewer/visual-diff/component) that `await` it need no edit beyond the
 * import path.
 */
export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set -- the codegen worker needs it to call the model.");
  }
  const baseURL = process.env.ANTHROPIC_BASE_URL || undefined;
  return createAnthropic({ apiKey, ...(baseURL ? { baseURL } : {}) });
}

/**
 * The model id a codegen run should use: CODEGEN_MODEL env override, else the
 * package default (a current Claude id). Replaces the platform's per-user/DB
 * getEffectiveModel(workspaceId, "design-system-codegen").
 */
export function getCodegenModel(): string {
  return process.env.CODEGEN_MODEL || DEFAULT_MODEL_ID;
}
```

- [ ] **Step 8: Write `packages/codegen/src/figma.ts` (port of `figma/client.ts`, single-token)**

Copy `AT/src/lib/figma/client.ts` then make exactly these changes: (a) delete lines 1–3 (`import "server-only"`, `getSession`, `refreshFigmaToken`); (b) delete the `REFRESH_SKEW_MS` const; (c) replace the whole `getValidFigmaAccessToken` function (source lines 44–78) with the single-token `getFigmaAccessToken` below; (d) keep `describeFigmaError`, `figmaAuthHeaders`, `figmaGet`, `getFileNodes`, `getFileNodesShallow`, `getFileImages`, `FIGMA_FILE_FETCH_TIMEOUT_MS`, `FIGMA_API_BASE`, `FIGMA_FETCH_TIMEOUT_MS`, `FigmaImagesResponse` VERBATIM. Result file top:

```ts
const FIGMA_API_BASE = "https://api.figma.com/v1";
const FIGMA_FETCH_TIMEOUT_MS = 20_000;
// GET /v1/files/:key/nodes returns full node subtrees -- for a large/complex
// file this can take much longer than a typical API call, so node fetches get
// a longer allowance than the default above.
export const FIGMA_FILE_FETCH_TIMEOUT_MS = 55_000;

// ... describeFigmaError verbatim from source lines 22-42 ...

/**
 * The Figma access token for the codegen worker: the FIGMA_ACCESS_TOKEN
 * personal access token (figd_...) from the Actions secret. Single-token only
 * -- the platform's browser-OAuth/session refresh path is gone (that was the
 * multi-tenant app's job). Returns null if unset so the caller can report
 * "Figma not configured" rather than throwing.
 */
export function getFigmaAccessToken(): string | null {
  return process.env.FIGMA_ACCESS_TOKEN ?? null;
}

// ... figmaAuthHeaders, figmaGet, getFileNodes, getFileNodesShallow,
//     FigmaImagesResponse, getFileImages -- ALL verbatim from source lines 87-168 ...
```

- [ ] **Step 9: Verify it compiles**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
pnpm install
pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
```
Expected: `pnpm install` resolves the new package + deps; `tsc --noEmit` exits 0 with no output (types.ts/models.ts/anthropic.ts/figma.ts all typecheck; the other `src/**` files don't exist yet so tsc only sees these).

- [ ] **Step 10: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/package.json packages/codegen/tsconfig.json packages/codegen/tsup.config.ts \
        packages/codegen/src/types.ts packages/codegen/src/models.ts packages/codegen/src/anthropic.ts packages/codegen/src/figma.ts \
        pnpm-lock.yaml
git commit -m "feat(codegen): scaffold packages/codegen + single-token clients and local types

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 2: Port the PURE modules + fixtures

Copy the modules with ZERO client/DB coupling: `paths.ts`, `checks.ts`, `review/types.ts`, `review/prop-types.ts`, `review/deterministic.ts`, `icon.ts`, and `tokens.ts` (the one pure module that needs a two-line type swap). Add committed fixture tests — the old scratchpad fixtures were lost on a context reset, so we re-create them here as a permanent suite.

**Files:**
- Create (copy verbatim): `packages/codegen/src/paths.ts`, `src/checks.ts`, `src/review/types.ts`, `src/review/prop-types.ts`, `src/review/deterministic.ts`, `src/icon.ts`
- Create (copy + 2 edits): `packages/codegen/src/tokens.ts`
- Test: `packages/codegen/test/paths.test.ts`, `test/prop-types.test.ts`, `test/deterministic.test.ts`

**Interfaces:**
- Consumes: `src/types.ts` (`DesignTokenCategory`) from Task 1.
- Produces: `paths.ts` → `slugify`, `pascalCase`, `componentIdentifier`, `componentSourcePaths`, `storybookDefaultStoryId`, `vercelBranchSlug`, `storybookStandUrl`, `GeneratedComponentFiles`, `ComponentSourcePaths`.
- Produces: `tokens.ts` → `TokenForCss`, `toCssVarName`, `generateTokensCss`.
- Produces: `review/prop-types.ts` → `parsePropType`, `buildOwnProps`, `buildComposedProps`, `buildExpectedComposedImports`, `parseCompositionImports`, `parseJsxLiteralProps`, `parseStoriesArgs`, `PropDomain`, `LiteralValue`, `ParsedProp`.
- Produces: `review/deterministic.ts` → `runDeterministicGates(files, ctx)`, `applyDeterministicFixes(files, findings)`.
- Produces: `review/types.ts` → `GeneratedFiles`, `Finding`, `ReviewContext`, `ReviewResult`, `Severity`, `FileKind`.
- Produces: `checks.ts` → `checkClassNamesMatch`, `checkStoriesNoNameCollision`, `extractReferencedClasses`, `ClassNameCheckResult`, `StoriesCheckResult`.
- Produces: `icon.ts` → `sanitizeSvg`, `buildIconComponentFiles`.

- [ ] **Step 1: Copy the six verbatim files**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
AT=/Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app
mkdir -p packages/codegen/src/review packages/codegen/test
cp "$AT/src/lib/design-system-codegen/paths.ts"            packages/codegen/src/paths.ts
cp "$AT/src/lib/design-system-codegen/checks.ts"           packages/codegen/src/checks.ts
cp "$AT/src/lib/design-system-codegen/icon.ts"             packages/codegen/src/icon.ts
cp "$AT/src/lib/design-system-codegen/review/types.ts"     packages/codegen/src/review/types.ts
cp "$AT/src/lib/design-system-codegen/review/prop-types.ts" packages/codegen/src/review/prop-types.ts
cp "$AT/src/lib/design-system-codegen/review/deterministic.ts" packages/codegen/src/review/deterministic.ts
```
These six have zero coupling imports (verified) — no edits needed. `icon.ts` imports only from `./paths`; `deterministic.ts` imports only from `../checks`, `./prop-types`, `./types`.

- [ ] **Step 2: Copy `tokens.ts` and apply the two edits**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
AT=/Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app
cp "$AT/src/lib/design-system-codegen/tokens.ts" packages/codegen/src/tokens.ts
```
Then edit `packages/codegen/src/tokens.ts`:
- Delete line 1: `import "server-only";`
- Replace line 2 `import type { DesignTokenCategory } from "@/db/schema";` with:
  ```ts
  import type { DesignTokenCategory } from "./types";
  ```
Everything else (`TokenForCss`, `toCssVarName`, `generateTokensCss`, `CATEGORY_ORDER`) stays verbatim.

- [ ] **Step 3: Verify the ports compile**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
```
Expected: exits 0, no output.

- [ ] **Step 4: Write `packages/codegen/test/paths.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  slugify,
  componentIdentifier,
  componentSourcePaths,
  storybookDefaultStoryId,
  storybookStandUrl,
} from "../src/paths";

test("slugify inserts hyphens at camelCase boundaries", () => {
  assert.equal(slugify("InputText"), "input-text");
  assert.equal(slugify("Button"), "button");
});

test("componentIdentifier prefixes digit-leading slugs so it is a valid identifier", () => {
  assert.equal(componentIdentifier("button"), "Button");
  assert.equal(componentIdentifier("24-outline-orders"), "N24OutlineOrders");
});

test("componentSourcePaths targets icons vs components and uses .module.scss", () => {
  const c = componentSourcePaths("button", false);
  assert.equal(c.dir, "src/components/button");
  assert.equal(c.cssPath, "src/components/button/Button.module.scss");
  const i = componentSourcePaths("plus", true);
  assert.equal(i.dir, "src/icons/plus");
  assert.equal(i.tsxPath, "src/icons/plus/Plus.tsx");
});

test("storybookDefaultStoryId is section-prefixed lowercase identifier", () => {
  assert.equal(storybookDefaultStoryId("button", false), "components-button--default");
  assert.equal(storybookDefaultStoryId("plus", true), "icons-plus--default");
});

test("storybookStandUrl handles {branch} template, fixed stand, and null", () => {
  assert.equal(storybookStandUrl("figma-sync-1", "https://ds-git-{branch}-team.vercel.app"), "https://ds-git-figma-sync-1-team.vercel.app");
  assert.equal(storybookStandUrl(null, "https://ds.example.com/"), "https://ds.example.com");
  assert.equal(storybookStandUrl(null, "https://ds-git-{branch}-team.vercel.app"), null);
  assert.equal(storybookStandUrl("x", undefined), null);
});
```

- [ ] **Step 5: Write `packages/codegen/test/prop-types.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePropType, parseJsxLiteralProps, parseStoriesArgs } from "../src/review/prop-types";

test("parsePropType recognizes literal unions, booleans, and open types", () => {
  const u = parsePropType("'primary' | 'secondary'");
  assert.equal(u.kind, "literals");
  if (u.kind === "literals") assert.deepEqual([...u.values].sort(), ["primary", "secondary"]);
  assert.equal(parsePropType("boolean").kind, "boolean");
  assert.equal(parsePropType("(e: MouseEvent) => void").kind, "open");
  assert.equal(parsePropType("string").kind, "open");
});

test("parseJsxLiteralProps extracts literal string/boolean attrs and skips expressions", () => {
  const props = parseJsxLiteralProps('<Button variant="primary" disabled onClick={fn} size={sz} />', "Button");
  const byName = Object.fromEntries(props.map((p) => [p.name, p.value]));
  assert.deepEqual(byName.variant, { kind: "string", v: "primary" });
  assert.deepEqual(byName.disabled, { kind: "boolean", v: true });
  assert.equal(byName.onClick.kind, "expr");
  assert.equal(byName.size.kind, "expr");
});

test("parseStoriesArgs reads args object literal values", () => {
  const args = parseStoriesArgs('export const Default = { args: { variant: "secondary", loading: true } };');
  const byName = Object.fromEntries(args.map((p) => [p.name, p.value]));
  assert.deepEqual(byName.variant, { kind: "string", v: "secondary" });
  assert.deepEqual(byName.loading, { kind: "boolean", v: true });
});
```
Note: if a specific assertion's exact shape differs from the source's output, adjust the assertion to the ACTUAL returned value (read `src/review/prop-types.ts`) — do not change the ported source. The test documents real behavior.

- [ ] **Step 6: Write `packages/codegen/test/deterministic.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { runDeterministicGates } from "../src/review/deterministic";
import type { GeneratedFiles, ReviewContext } from "../src/review/types";
import { buildOwnProps } from "../src/review/prop-types";

function ctx(overrides: Partial<ReviewContext> = {}): ReviewContext {
  return {
    componentName: "Button",
    fileBase: "Button",
    tokenVarNames: new Set(["--text-primary"]),
    ownProps: new Map(),
    composedProps: new Map(),
    expectedComposedImports: new Map(),
    ...overrides,
  };
}

const CLEAN: GeneratedFiles = {
  tsx: `import styles from "./Button.module.scss";\nexport function Button({ variant }: { variant: "primary" | "secondary" }) {\n  return <button className={styles.root} data-variant={variant} />;\n}\n`,
  css: `.root { color: var(--text-primary); }\n`,
  stories: `import { Button } from "./Button";\nexport default { title: "Components/Button", component: Button };\nexport const Default = { args: { variant: "primary" } };\n`,
  index: `export { Button } from "./Button";\n`,
};

test("a clean component has no build-breaking findings", () => {
  const findings = runDeterministicGates(CLEAN, ctx());
  assert.equal(findings.filter((f) => f.severity === "build-breaking").length, 0);
});

test("an unknown token var is flagged build-breaking", () => {
  const bad = { ...CLEAN, css: `.root { color: var(--nope-not-a-token); }\n` };
  const findings = runDeterministicGates(bad, ctx());
  assert.ok(findings.some((f) => f.severity === "build-breaking"));
});

test("a story arg outside the prop's literal union is flagged (A7a self value gate)", () => {
  const own = buildOwnProps({ props: [{ name: "variant", type: "'primary' | 'secondary'" }] });
  const bad = { ...CLEAN, stories: CLEAN.stories.replace('variant: "primary"', 'variant: "Primary"') };
  const findings = runDeterministicGates(bad, ctx({ ownProps: own }));
  assert.ok(findings.some((f) => f.severity === "build-breaking"));
});
```
Note: token/gate messages and ids are not asserted (they may evolve) — only the presence/severity, which is the contract. If the clean fixture trips a gate, fix the FIXTURE to be genuinely clean (read the gate), never the ported gate.

- [ ] **Step 7: Run the fixtures**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
pnpm --filter @d-2-g-8/codegen exec tsx --test test/paths.test.ts test/prop-types.test.ts test/deterministic.test.ts
```
Expected: all tests pass (`# pass N`, `# fail 0`).

- [ ] **Step 8: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/paths.ts packages/codegen/src/checks.ts packages/codegen/src/icon.ts \
        packages/codegen/src/tokens.ts packages/codegen/src/review/types.ts \
        packages/codegen/src/review/prop-types.ts packages/codegen/src/review/deterministic.ts \
        packages/codegen/test/paths.test.ts packages/codegen/test/prop-types.test.ts packages/codegen/test/deterministic.test.ts
git commit -m "feat(codegen): port pure modules (paths/checks/tokens/icon/review gates) + fixtures

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 3: File loaders (`loaders.ts`) + temp-dir fixture

Replace `data.ts`'s Drizzle loaders with file loaders that read the repo's committed state, plus a `writeComponent` that lands the 4 files + `<slug>.contract.json`. This is the DB→git bridge.

**Files:**
- Create: `packages/codegen/src/loaders.ts`
- Test: `packages/codegen/test/loaders.test.ts`

**Interfaces:**
- Consumes: `TokenForCss` (`./tokens`), `StoredComponentContract`/`DesignComponentVariant`/`DesignComponentState`/`DesignTokenCategory` (`./types`), `GeneratedComponentFiles`/`componentSourcePaths` (`./paths`).
- Produces:
  - `findRepoRoot(start?: string): string`
  - `interface ManifestEntry { name: string; slug: string; isIcon: boolean; figmaNodeIds: string[]; }`
  - `interface Manifest { components: ManifestEntry[]; icons: ManifestEntry[]; figmaFileKey?: string; }`
  - `interface ComponentContractFile { name: string; slug: string; isIcon: boolean; figmaNodeIds: string[]; variants: DesignComponentVariant[]; states: DesignComponentState[]; contract: StoredComponentContract; }`
  - `loadManifest(root?: string): Manifest`
  - `loadTokens(root?: string): TokenForCss[]`
  - `loadComponentContract(slug: string, root?: string): ComponentContractFile | null`
  - `loadCommittedContracts(root?: string): Map<string, StoredComponentContract>`
  - `loadAllComponentRows(root?: string): { slug: string; figmaNodeIds: string[]; isIcon: boolean }[]`
  - `writeComponent(contractFile: ComponentContractFile, files: GeneratedComponentFiles, root?: string): string[]` (returns written paths)

- [ ] **Step 1: Write the failing test `packages/codegen/test/loaders.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  loadManifest,
  loadTokens,
  loadComponentContract,
  loadCommittedContracts,
  loadAllComponentRows,
  writeComponent,
  type ComponentContractFile,
} from "../src/loaders";

function makeRepo(): string {
  const root = mkdtempSync(join(tmpdir(), "codegen-loaders-"));
  writeFileSync(
    join(root, "design-system.manifest.json"),
    JSON.stringify({
      figmaFileKey: "FILEKEY",
      components: [{ name: "Button", slug: "button", isIcon: false, figmaNodeIds: ["1:2"] }],
      icons: [{ name: "Plus", slug: "plus", isIcon: true, figmaNodeIds: ["3:4"] }],
    }),
  );
  mkdirSync(join(root, "tokens"), { recursive: true });
  writeFileSync(
    join(root, "tokens", "tokens.json"),
    JSON.stringify({ "text-primary": { category: "color", value: "#0a0a0a" } }),
  );
  const dir = join(root, "packages", "components", "src", "components", "button");
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, "button.contract.json"),
    JSON.stringify({
      name: "Button",
      slug: "button",
      isIcon: false,
      figmaNodeIds: ["1:2"],
      variants: [{ name: "primary" }],
      states: [],
      contract: { props: [{ name: "variant", type: "'primary' | 'secondary'" }], cssVariables: [], classNames: ["root"] },
    }),
  );
  return root;
}

test("loadManifest reads components, icons, and figmaFileKey", () => {
  const root = makeRepo();
  const m = loadManifest(root);
  assert.equal(m.figmaFileKey, "FILEKEY");
  assert.equal(m.components[0].slug, "button");
  assert.equal(m.icons[0].slug, "plus");
});

test("loadTokens maps tokens.json to TokenForCss[]", () => {
  const root = makeRepo();
  const t = loadTokens(root);
  assert.deepEqual(t, [{ name: "text-primary", category: "color", value: "#0a0a0a" }]);
});

test("loadComponentContract / loadCommittedContracts / loadAllComponentRows read committed state", () => {
  const root = makeRepo();
  const c = loadComponentContract("button", root);
  assert.equal(c?.contract.props[0].name, "variant");
  const committed = loadCommittedContracts(root);
  assert.equal(committed.get("button")?.props[0].type, "'primary' | 'secondary'");
  const rows = loadAllComponentRows(root);
  assert.equal(rows.length, 2); // button + plus from the manifest
});

test("writeComponent writes 4 files + contract.json under packages/components", () => {
  const root = makeRepo();
  const contractFile: ComponentContractFile = {
    name: "Chip",
    slug: "chip",
    isIcon: false,
    figmaNodeIds: [],
    variants: [],
    states: [],
    contract: { props: [], cssVariables: [], classNames: [] },
  };
  const written = writeComponent(
    contractFile,
    {
      componentName: "Chip",
      tsxPath: "src/components/chip/Chip.tsx",
      tsxContent: "export const Chip = () => null;\n",
      cssPath: "src/components/chip/Chip.module.scss",
      cssContent: ".root {}\n",
      storiesPath: "src/components/chip/Chip.stories.tsx",
      storiesContent: "export default {};\n",
      indexPath: "src/components/chip/index.ts",
      indexContent: "export { Chip } from './Chip';\n",
      deletePaths: [],
      inputTokens: 0,
      outputTokens: 0,
      costUsd: 0,
    },
    root,
  );
  const base = join(root, "packages", "components", "src", "components", "chip");
  assert.ok(existsSync(join(base, "Chip.tsx")));
  assert.ok(existsSync(join(base, "chip.contract.json")));
  assert.equal(JSON.parse(readFileSync(join(base, "chip.contract.json"), "utf8")).name, "Chip");
  assert.ok(written.length >= 5);
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
pnpm --filter @d-2-g-8/codegen exec tsx --test test/loaders.test.ts
```
Expected: FAIL — `Cannot find module '../src/loaders'`.

- [ ] **Step 3: Write `packages/codegen/src/loaders.ts`**

```ts
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import type { TokenForCss } from "./tokens";
import type {
  DesignTokenCategory,
  DesignComponentVariant,
  DesignComponentState,
  StoredComponentContract,
} from "./types";
import { componentSourcePaths, type GeneratedComponentFiles } from "./paths";

const MANIFEST_FILE = "design-system.manifest.json";
const TOKENS_FILE = join("tokens", "tokens.json");
const COMPONENTS_ROOT = join("packages", "components", "src");

export interface ManifestEntry {
  name: string;
  slug: string;
  isIcon: boolean;
  figmaNodeIds: string[];
}

export interface Manifest {
  components: ManifestEntry[];
  icons: ManifestEntry[];
  figmaFileKey?: string;
}

/** The on-disk <slug>.contract.json shape (see docs/design-system-admin/conventions.md). */
export interface ComponentContractFile {
  name: string;
  slug: string;
  isIcon: boolean;
  figmaNodeIds: string[];
  variants: DesignComponentVariant[];
  states: DesignComponentState[];
  contract: StoredComponentContract;
}

/** Walk up from `start` to the monorepo root (the dir holding the manifest). */
export function findRepoRoot(start: string = process.cwd()): string {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, MANIFEST_FILE))) return dir;
    const parent = dirname(dir);
    if (parent === dir) throw new Error(`Could not find ${MANIFEST_FILE} walking up from ${start}`);
    dir = parent;
  }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function loadManifest(root: string = findRepoRoot()): Manifest {
  const m = readJson<Partial<Manifest>>(join(root, MANIFEST_FILE));
  return { components: m.components ?? [], icons: m.icons ?? [], figmaFileKey: m.figmaFileKey };
}

export function loadTokens(root: string = findRepoRoot()): TokenForCss[] {
  const raw = readJson<Record<string, { category: string; value: string }>>(join(root, TOKENS_FILE));
  return Object.entries(raw).map(([name, meta]) => ({
    name,
    category: meta.category as DesignTokenCategory,
    value: meta.value,
  }));
}

function componentDir(slug: string, isIcon: boolean, root: string): string {
  return join(root, COMPONENTS_ROOT, isIcon ? "icons" : "components", slug);
}

/** Load one component's contract file, searching components/ then icons/. */
export function loadComponentContract(slug: string, root: string = findRepoRoot()): ComponentContractFile | null {
  for (const isIcon of [false, true]) {
    const path = join(componentDir(slug, isIcon, root), `${slug}.contract.json`);
    if (existsSync(path)) return readJson<ComponentContractFile>(path);
  }
  return null;
}

/** Every committed component's persisted contract (props/types/tokens/classes),
 *  keyed by slug -- the composition-grounding source (was: committed DB rows). */
export function loadCommittedContracts(root: string = findRepoRoot()): Map<string, StoredComponentContract> {
  const out = new Map<string, StoredComponentContract>();
  const manifest = loadManifest(root);
  for (const entry of [...manifest.components, ...manifest.icons]) {
    const file = loadComponentContract(entry.slug, root);
    if (file) out.set(entry.slug, file.contract);
  }
  return out;
}

/** Rows for buildComponentIndex / dependencyClosure -- from the manifest. */
export function loadAllComponentRows(
  root: string = findRepoRoot(),
): { slug: string; figmaNodeIds: string[]; isIcon: boolean }[] {
  const manifest = loadManifest(root);
  return [...manifest.components, ...manifest.icons].map((e) => ({
    slug: e.slug,
    figmaNodeIds: e.figmaNodeIds ?? [],
    isIcon: e.isIcon,
  }));
}

/**
 * Write a generated component to the working tree: the 4 source files + its
 * <slug>.contract.json, honoring `deletePaths` (stale legacy files from a
 * previous name). Paths in `files` are relative to packages/components (e.g.
 * "src/components/<slug>/<Name>.tsx"); we prepend the package root. Returns the
 * absolute paths written.
 */
export function writeComponent(
  contractFile: ComponentContractFile,
  files: GeneratedComponentFiles,
  root: string = findRepoRoot(),
): string[] {
  const pkgRoot = join(root, "packages", "components");
  const abs = (rel: string) => join(pkgRoot, rel);
  const write = (rel: string, content: string): string => {
    const path = abs(rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    return path;
  };
  // Remove stale legacy files first (e.g. an old pascalCase name).
  for (const rel of files.deletePaths) {
    const path = abs(rel);
    if (existsSync(path)) rmSync(path);
  }
  const written = [
    write(files.tsxPath, files.tsxContent),
    write(files.cssPath, files.cssContent),
    write(files.storiesPath, files.storiesContent),
    write(files.indexPath, files.indexContent),
  ];
  const paths = componentSourcePaths(contractFile.slug, contractFile.isIcon);
  const contractPath = join(paths.dir, `${contractFile.slug}.contract.json`);
  written.push(write(contractPath, JSON.stringify(contractFile, null, 2) + "\n"));
  return written;
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
pnpm --filter @d-2-g-8/codegen exec tsx --test test/loaders.test.ts
pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
```
Expected: tests pass (`# fail 0`); `tsc --noEmit` exits 0.

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/loaders.ts packages/codegen/test/loaders.test.ts
git commit -m "feat(codegen): file loaders (manifest/tokens/contracts) + writeComponent

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 4: Port the LLM / distiller / review modules (client + loader swaps)

Port the modules that call the Figma or Anthropic clients: `figma-node.ts`, `dependencies.ts`, `icon-fetch.ts`, `review/reviewer.ts`, `review/index.ts`, `component.ts`, `visual-diff.ts`, `token-derive.ts`. Each is copied then edited ONLY at its coupling edges.

**Files:**
- Create (copy + edits): `src/figma-node.ts`, `src/dependencies.ts`, `src/icon-fetch.ts`, `src/review/reviewer.ts`, `src/review/index.ts`, `src/component.ts`, `src/visual-diff.ts`, `src/token-derive.ts`

**Interfaces:**
- Consumes: `./figma` (`getFileNodes`, `getFileNodesShallow`, `getFileImages`, `describeFigmaError`), `./anthropic` (`getAnthropicClient`), `./models` (`estimateCostUsd`), `./types` (schema types), `./tokens`, `./paths`, `./checks`, `./review/*` from Tasks 1–3.
- Produces:
  - `figma-node.ts` → `fetchComponentDesignSpec`, `fetchScreenDesign`, `ComponentIndex`, `ComponentRef`, `ComponentDesign`, `FigmaNode`, `FigmaNodesResponse`, `solidFill`, `radiusOf`, `colorToCss`.
  - `dependencies.ts` → `buildComponentIndex`, `buildDependencyEdges`, `dependencyClosure`, `topoSort`, `topoLevels`.
  - `icon-fetch.ts` → `fetchIconSvg(fileKey, nodeId, accessToken)`.
  - `review/reviewer.ts` → `reviewWithLlm`.
  - `review/index.ts` → `reviewAndFix`, `ReviewAndFixArgs`, re-exported review types.
  - `component.ts` → `generateComponentCode`, `generateComponentCodeReviewed`, `fixComponentFiles`, `composedApiDescription`, `ComponentForCodegen`, `ComponentContract`, `ChildContract`, plus its pass-through re-exports.
  - `visual-diff.ts` → `reviewVisualDiff`.
  - `token-derive.ts` → `deriveTokensFromComponents` (refactored signature, see Step 8).

- [ ] **Step 1: Port `figma-node.ts`**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
AT=/Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app
cp "$AT/src/lib/design-system-codegen/figma-node.ts" packages/codegen/src/figma-node.ts
```
Edits to `packages/codegen/src/figma-node.ts`:
- Delete line 1: `import "server-only";`
- Replace `import { getFileNodes } from "@/lib/figma/client";` with:
  ```ts
  import { getFileNodes } from "./figma";
  ```
- The `./tokens` import stays. Everything else verbatim.

- [ ] **Step 2: Port `dependencies.ts`**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
AT=/Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app
cp "$AT/src/lib/design-system-codegen/dependencies.ts" packages/codegen/src/dependencies.ts
```
Edits to `packages/codegen/src/dependencies.ts`:
- Delete line 1: `import "server-only";`
- Replace `import { getFileNodes } from "@/lib/figma/client";` with `import { getFileNodes } from "./figma";`
- Replace `import { componentIdentifier } from "./component";` with `import { componentIdentifier } from "./paths";` (avoids dragging component.ts's LLM/deps transitively; `componentIdentifier` lives in paths).
- The `./figma-node` type import stays. Everything else verbatim.

- [ ] **Step 3: Port `icon-fetch.ts`**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
AT=/Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app
cp "$AT/src/lib/design-system-codegen/icon-fetch.ts" packages/codegen/src/icon-fetch.ts
```
Edits to `packages/codegen/src/icon-fetch.ts`:
- Delete line 1: `import "server-only";`
- Replace `import { getFileImages } from "@/lib/figma/client";` with `import { getFileImages } from "./figma";`
- Everything else verbatim.

- [ ] **Step 4: Port `review/reviewer.ts`**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
AT=/Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app
cp "$AT/src/lib/design-system-codegen/review/reviewer.ts" packages/codegen/src/review/reviewer.ts
```
Edits to `packages/codegen/src/review/reviewer.ts`:
- Delete line 1: `import "server-only";`
- Replace `import { getAnthropicClient } from "@/lib/llm/client";` with `import { getAnthropicClient } from "../anthropic";`
- `ai`, `zod`, and `./types` imports stay. Everything else verbatim.

- [ ] **Step 5: Port `review/index.ts`**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
AT=/Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app
cp "$AT/src/lib/design-system-codegen/review/index.ts" packages/codegen/src/review/index.ts
```
Edits: delete line 1 `import "server-only";`. Everything else verbatim (it imports only `./deterministic`, `./reviewer`, `./types`).

- [ ] **Step 6: Port `component.ts`**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
AT=/Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app
cp "$AT/src/lib/design-system-codegen/component.ts" packages/codegen/src/component.ts
```
Edits to `packages/codegen/src/component.ts` (import block only — the body is verbatim):
- Delete line 1: `import "server-only";`
- Replace `import { getAnthropicClient } from "@/lib/llm/client";` with `import { getAnthropicClient } from "./anthropic";`
- Replace `import { estimateCostUsd } from "@/lib/models";` with `import { estimateCostUsd } from "./models";`
- Replace `import type { DesignComponentVariant, DesignComponentState, StoredComponentContract } from "@/db/schema";` with:
  ```ts
  import type { DesignComponentVariant, DesignComponentState, StoredComponentContract } from "./types";
  ```
- Keep the local imports (`./tokens`, `./review/prop-types`, `./paths`, `./checks`, `./review`) and `ai`/`zod` verbatim. Do NOT touch any function body.

- [ ] **Step 7: Port `visual-diff.ts`**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
AT=/Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app
cp "$AT/src/lib/design-system-codegen/visual-diff.ts" packages/codegen/src/visual-diff.ts
```
Edits: delete line 1 `import "server-only";`; replace `import { getAnthropicClient } from "@/lib/llm/client";` with `import { getAnthropicClient } from "./anthropic";`. The `import type { Finding, FileKind } from "./review";` barrel import, `ai`, and `zod` stay. Everything else verbatim.

- [ ] **Step 8: Port `token-derive.ts` (rows-in / tokens-out refactor)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
AT=/Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app
cp "$AT/src/lib/design-system-codegen/token-derive.ts" packages/codegen/src/token-derive.ts
```
`token-derive.ts` is used by the Figma token SYNC (Phase 3/4 admin), not by the generate CLI. Port it so the package is complete and compiles, dropping BOTH DB coupling ends: the DB read of component node ids becomes a passed-in `rows` param, and the DB upsert/prune becomes a RETURN of the harvested tokens (persistence is the caller's job in later phases). Edits to `packages/codegen/src/token-derive.ts`:
- Delete `import "server-only";`
- Delete `import { db } from "@/db";`, `import { designComponent, designToken } from "@/db/schema";`, `import { and, eq, inArray } from "drizzle-orm";`
- Replace `import { getFileNodesShallow, describeFigmaError } from "@/lib/figma/client";` with `import { getFileNodesShallow, describeFigmaError } from "./figma";`
- Keep `import { solidFill, radiusOf, type FigmaNode, type FigmaNodesResponse } from "./figma-node";` and `import { toCssVarName } from "./tokens";`
- Add `import type { TokenForCss } from "./tokens";`
- Change the exported `DeriveTokensResult` and function signature to drop `workspaceId` and return the tokens:
  ```ts
  export interface DeriveTokensResult {
    tokens: TokenForCss[];
    colors: number;
    radii: number;
  }

  export async function deriveTokensFromComponents(
    rows: { figmaNodeIds: string[]; isIcon: boolean }[],
    fileKey: string,
    accessToken: string,
  ): Promise<DeriveTokensResult>
  ```
- Inside the body: replace the `db.select(...).from(designComponent)...` read with `const components = rows.filter((r) => !r.isIcon);` then `const rootNodeIds = components.map((c) => c.figmaNodeIds[0]).filter(Boolean);` (mirror how the source used `c.figmaNodeIds[0]`). Remove `upsertDerivedToken` and the existing-token read + prune (the DB writes); instead collect harvested tokens into a `TokenForCss[]` (category `"color"`/`"radius"`, name via `colorTokenName`/`toCssVarName`, value the css color/radius) and return `{ tokens, colors, radii }` where `colors`/`radii` are the counts. Keep `walk`, `colorTokenName`, and all the traversal constants/logic verbatim.

If this refactor proves larger than a mechanical edit, keep `deriveTokensFromComponents` returning just the counts and building the token list, but do NOT reintroduce any DB/drizzle import — the package must not depend on `@/db`.

- [ ] **Step 9: Verify everything compiles**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
pnpm --filter @d-2-g-8/codegen exec tsx --test test/*.test.ts
```
Expected: `tsc --noEmit` exits 0 (all coupling swapped, no unresolved `@/…` or `server-only`); all fixture tests still pass.

- [ ] **Step 10: Grep for leftover coupling (safety net)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
! grep -rn 'server-only\|@/db\|@/lib\|drizzle-orm' packages/codegen/src && echo "CLEAN: no platform coupling remains"
```
Expected: prints `CLEAN: no platform coupling remains` (the grep finds nothing, so `!` makes the command succeed).

- [ ] **Step 11: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/figma-node.ts packages/codegen/src/dependencies.ts packages/codegen/src/icon-fetch.ts \
        packages/codegen/src/review/reviewer.ts packages/codegen/src/review/index.ts \
        packages/codegen/src/component.ts packages/codegen/src/visual-diff.ts packages/codegen/src/token-derive.ts
git commit -m "feat(codegen): port distiller/component/review/visual-diff/token-derive (client+loader swaps)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 5: The `codegen` CLI (`cli.ts`) + package barrel (`index.ts`)

Wire it together: `codegen generate <slug> [--icon]` runs load → distill → generate → write (icons: fetch SVG → build → write, deterministic, no LLM). `codegen doctor` and `codegen --help` run with NO env (the dry checks the Phase 2 boundary requires).

**Files:**
- Create: `packages/codegen/src/index.ts` (public API barrel)
- Create: `packages/codegen/src/cli.ts`

**Interfaces:**
- Consumes: all of Tasks 1–4 (`loaders`, `figma-node`, `dependencies`, `component`, `icon`, `icon-fetch`, `anthropic`, `figma`).
- Produces: `src/index.ts` (re-exports the programmatic API); `src/cli.ts` (executable entry, `main()`).

- [ ] **Step 1: Write `packages/codegen/src/index.ts`**

```ts
// Public programmatic API of the codegen package (imported by later phases /
// the admin). The CLI (cli.ts) is a separate bin entry.
export * from "./types";
export * from "./models";
export * from "./paths";
export * from "./tokens";
export * from "./loaders";
export * from "./figma";
export * from "./anthropic";
export * from "./figma-node";
export * from "./dependencies";
export * from "./icon";
export * from "./icon-fetch";
export * from "./component";
export { reviewAndFix } from "./review";
export type { ReviewAndFixArgs, GeneratedFiles, ReviewContext, ReviewResult, Finding } from "./review";
```
Note: if any `export *` produces a duplicate-name conflict (e.g. `component.ts` already re-exports some `paths`/`checks`/`prop-types` symbols), replace the conflicting broad `export *` with explicit named re-exports so tsc stays clean. Run tsc after writing and resolve any TS2308 duplicate-export errors this way.

- [ ] **Step 2: Write `packages/codegen/src/cli.ts`**

```ts
import { getFigmaAccessToken } from "./figma";
import { getAnthropicClient, getCodegenModel } from "./anthropic";
import {
  findRepoRoot,
  loadManifest,
  loadTokens,
  loadComponentContract,
  loadCommittedContracts,
  loadAllComponentRows,
  writeComponent,
  type ComponentContractFile,
} from "./loaders";
import { buildComponentIndex } from "./dependencies";
import { fetchComponentDesignSpec } from "./figma-node";
import { generateComponentCodeReviewed, type ComponentForCodegen } from "./component";
import { buildIconComponentFiles } from "./icon";
import { fetchIconSvg } from "./icon-fetch";

const HELP = `codegen -- design-system component generator

Usage:
  codegen generate <slug> [--icon]   Distill the Figma node and generate the
                                     component's tsx/scss/stories/index +
                                     <slug>.contract.json into packages/components.
  codegen doctor                     Check env + manifest presence (no network).
  codegen --help                     Show this help.

Environment (for generate):
  FIGMA_ACCESS_TOKEN   Figma personal access token (figd_...).
  ANTHROPIC_API_KEY    Anthropic key (not needed for --icon).
  CODEGEN_MODEL        Optional model id override (default: package default).
  FIGMA_FILE_KEY       Optional; overrides the manifest's figmaFileKey.
`;

function resolveFileKey(root: string): string {
  const fromEnv = process.env.FIGMA_FILE_KEY;
  const fromManifest = loadManifest(root).figmaFileKey;
  const key = fromEnv || fromManifest;
  if (!key) throw new Error("No Figma file key: set FIGMA_FILE_KEY or add figmaFileKey to design-system.manifest.json");
  return key;
}

function doctor(): number {
  const checks: [string, boolean][] = [];
  let root = "";
  try {
    root = findRepoRoot();
    checks.push([`manifest found at ${root}/design-system.manifest.json`, true]);
  } catch {
    checks.push(["design-system.manifest.json found", false]);
  }
  checks.push(["FIGMA_ACCESS_TOKEN set", !!process.env.FIGMA_ACCESS_TOKEN]);
  checks.push(["ANTHROPIC_API_KEY set", !!process.env.ANTHROPIC_API_KEY]);
  checks.push([`model = ${getCodegenModel()}`, true]);
  if (root) {
    const m = loadManifest(root);
    checks.push([`manifest lists ${m.components.length} components + ${m.icons.length} icons`, true]);
    checks.push(["figma file key resolvable", !!(process.env.FIGMA_FILE_KEY || m.figmaFileKey)]);
  }
  for (const [label, ok] of checks) console.log(`${ok ? "ok  " : "MISS"} ${label}`);
  return 0; // doctor never fails the process -- it reports.
}

async function generate(slug: string, forceIcon: boolean): Promise<number> {
  const root = findRepoRoot();
  const existing = loadComponentContract(slug, root);
  const manifest = loadManifest(root);
  const entry =
    manifest.components.find((c) => c.slug === slug) ?? manifest.icons.find((c) => c.slug === slug) ?? null;
  if (!existing && !entry) {
    console.error(`Unknown component "${slug}" -- not in the manifest and no contract file on disk.`);
    return 1;
  }
  const isIcon = forceIcon || existing?.isIcon || entry?.isIcon || false;
  const name = existing?.name ?? entry?.name ?? slug;
  const figmaNodeIds = existing?.figmaNodeIds ?? entry?.figmaNodeIds ?? [];

  const token = getFigmaAccessToken();
  if (!token) {
    console.error("FIGMA_ACCESS_TOKEN is not set.");
    return 1;
  }
  const fileKey = resolveFileKey(root);

  if (isIcon) {
    // Icons are deterministic: fetch the SVG and transform it. No LLM.
    if (figmaNodeIds.length === 0) {
      console.error(`Icon "${slug}" has no figmaNodeIds in the manifest/contract.`);
      return 1;
    }
    const svg = await fetchIconSvg(fileKey, figmaNodeIds[0], token);
    if (!svg) {
      console.error(`Figma did not return an SVG for icon "${slug}" (node ${figmaNodeIds[0]}).`);
      return 1;
    }
    const files = buildIconComponentFiles(slug, svg);
    const contractFile: ComponentContractFile = {
      name, slug, isIcon: true, figmaNodeIds,
      variants: existing?.variants ?? [], states: existing?.states ?? [],
      contract: { props: [], cssVariables: [], classNames: [] },
    };
    const written = writeComponent(contractFile, files, root);
    console.log(`Wrote icon ${slug}:\n${written.map((p) => `  ${p}`).join("\n")}`);
    return 0;
  }

  // Regular component: distill the real Figma design + composition, then generate.
  const tokens = loadTokens(root);
  const childContracts = loadCommittedContracts(root);
  const index = buildComponentIndex(loadAllComponentRows(root));
  const design = await fetchComponentDesignSpec(fileKey, figmaNodeIds, token, tokens, index, slug);

  const component: ComponentForCodegen = {
    slug, name,
    description: undefined,
    variants: existing?.variants ?? [],
    states: existing?.states ?? [],
    isIcon: false,
    designSpec: design?.spec,
    uses: design?.uses,
  };

  const model = getCodegenModel();
  // getAnthropicClient() throws early if ANTHROPIC_API_KEY is missing.
  getAnthropicClient();
  const reviewed = await generateComponentCodeReviewed(model, component, tokens, childContracts);

  const contractFile: ComponentContractFile = {
    name, slug, isIcon: false, figmaNodeIds,
    variants: component.variants, states: component.states,
    contract: reviewed.contract,
  };
  const written = writeComponent(contractFile, reviewed, root);
  console.log(
    `Wrote ${slug} (review ${reviewed.reviewPassed ? "PASSED" : "did NOT pass"}, ` +
      `${reviewed.reviewFindings.length} findings):\n${written.map((p) => `  ${p}`).join("\n")}`,
  );
  return reviewed.reviewPassed ? 0 : 2;
}

async function main(): Promise<number> {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") {
    console.log(HELP);
    return 0;
  }
  if (cmd === "doctor") return doctor();
  if (cmd === "generate") {
    const slug = argv.find((a, i) => i > 0 && !a.startsWith("-"));
    if (!slug) {
      console.error("generate needs a <slug>. See `codegen --help`.");
      return 1;
    }
    return generate(slug, argv.includes("--icon"));
  }
  console.error(`Unknown command "${cmd}". See \`codegen --help\`.`);
  return 1;
}

main().then((code) => process.exit(code)).catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
```
Note: `generateComponentCodeReviewed` returns `GeneratedComponentFiles & { contract; reviewFindings; reviewPassed }`, and `GeneratedComponentFiles` is exactly the shape `writeComponent` consumes — so `writeComponent(contractFile, reviewed, root)` typechecks directly. If tsc reports the `argv.find((a, i) => i > 0 …)` predicate needs adjustment, extract the slug as `argv.slice(1).find((a) => !a.startsWith("-"))`.

- [ ] **Step 3: Verify compile + the no-env dry commands**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
env -u FIGMA_ACCESS_TOKEN -u ANTHROPIC_API_KEY pnpm --filter @d-2-g-8/codegen exec tsx src/cli.ts --help
env -u FIGMA_ACCESS_TOKEN -u ANTHROPIC_API_KEY pnpm --filter @d-2-g-8/codegen exec tsx src/cli.ts doctor
```
Expected: `tsc --noEmit` exits 0. `--help` prints the usage. `doctor` prints the checks (manifest `ok`, both tokens `MISS`, model line) and exits 0 — proving the CLI runs with no env.

- [ ] **Step 4: Verify the real build produces `dist/cli.js`**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
pnpm --filter @d-2-g-8/codegen build
node packages/codegen/dist/cli.js --help
```
Expected: `tsup` emits `dist/cli.js`, `dist/index.js`, and `.d.ts`; `node dist/cli.js --help` prints usage (the shebang'd bin works under plain node).

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/index.ts packages/codegen/src/cli.ts
git commit -m "feat(codegen): generate/doctor/help CLI + package barrel

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 6: Full verify, manifest `figmaFileKey`, gitignore, README

Prove the Phase 2 boundary holds across the whole monorepo, seed the manifest with the DS Figma file key so a live `generate` can resolve it, and document the package + the user-gated live smoke.

**Files:**
- Modify: `design-system.manifest.json` (add `figmaFileKey`)
- Modify: `.gitignore` (ignore `packages/codegen/dist`)
- Create: `packages/codegen/README.md`

**Interfaces:** none new — this task is verification + docs + config.

- [ ] **Step 1: Add `figmaFileKey` to the manifest**

Edit `design-system.manifest.json` to add the DS Figma file key (WhaleUI2B, per SESSION-HANDOFF §2) as a top-level field, keeping the existing `components`/`icons`:
```json
{
  "figmaFileKey": "OcaHeBKMqemoZZt2C5z0wd",
  "components": [
    { "name": "Button", "slug": "button", "isIcon": false, "figmaNodeIds": [] }
  ],
  "icons": []
}
```
This is additive and backward-compatible (`loadManifest` already reads `figmaFileKey?`).

- [ ] **Step 2: Ignore the codegen build output**

Append to `.gitignore`:
```
# codegen package build output
packages/codegen/dist/
```

- [ ] **Step 3: Write `packages/codegen/README.md`**

```markdown
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
```

- [ ] **Step 4: Full monorepo verification**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
pnpm install
pnpm -r typecheck
pnpm --filter @d-2-g-8/codegen test
pnpm --filter @d-2-g-8/codegen build
env -u FIGMA_ACCESS_TOKEN -u ANTHROPIC_API_KEY pnpm --filter @d-2-g-8/codegen codegen doctor
pnpm -F @d-2-g-8/design-system build
```
Expected: `pnpm -r typecheck` green across ALL packages (components, admin, codegen — the workspace glob picked up codegen automatically, so it joins CI's existing `pnpm -r typecheck`). All codegen fixtures pass. `tsup` build succeeds. `doctor` runs no-env. The existing library build still succeeds (proves the new package didn't disturb `packages/components`).

- [ ] **Step 5: Confirm no platform coupling and no accidental edits to the source repo**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
! grep -rn 'server-only\|@/db\|@/lib\|drizzle-orm' packages/codegen/src && echo "CLEAN"
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app && git status --porcelain
```
Expected: `CLEAN` printed; `ai-tools-app` working tree shows NO changes (the port only COPIED from it — nothing deleted or modified there; cutover is Phase 6).

- [ ] **Step 6: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add design-system.manifest.json .gitignore packages/codegen/README.md
git commit -m "chore(codegen): seed manifest figmaFileKey, ignore dist, add README

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

- [ ] **Step 7: Document the user-gated live smoke (do NOT run without the user)**

Record in the session notes / handoff that a live end-to-end `generate` is user-gated (costs Figma + Anthropic calls), and the exact command to run when the user approves:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
FIGMA_ACCESS_TOKEN=figd_... ANTHROPIC_API_KEY=sk-ant-... \
  pnpm --filter @d-2-g-8/codegen codegen generate button
```
Expected on a live run: distills the Button node, generates the 4 files + `button.contract.json` under `packages/components/src/components/button/`, prints the review pass/fail summary. This is the smoke that also validates the client swaps end-to-end. Leave it for the user.

---

## Post-plan: finishing the branch

After Task 6, the branch `phase2-port-core` holds the whole port, tsc-green, fixtures green, CLI runs. Per the finishing-a-development-branch skill, present the user options (open a PR to `master`, keep the branch, etc.). Do NOT merge or push without explicit user approval. Phase 3 (the worker validation loop + git/PR) is the next spec→plan→SDD cycle.

## Self-Review notes (checked against the phase2-port-core spec)

- **Port inventory coverage:** every file in the spec's "PORT ~as-is" and "PORT with client swap" lists has a task step (pure → Task 2; clients → Task 1; distiller/component/reviewer/index/visual-diff/token-derive/dependencies → Task 4; icon-fetch → Task 4). `data.ts` + token-derive DB ops → `loaders.ts` (Task 3). `figma/client.ts` → `figma.ts` (Task 1); `getAnthropicClient`/`getEffectiveModel` → `anthropic.ts` (Task 1).
- **NOT ported (per spec):** `github/client.ts`, `session.ts`, `reconcile.ts`, `ci-autofix.ts`, `ci-map.ts`, `visual-review.ts`, `screenshot/client.ts`, `mockup-*`, `screen-story.ts` — correctly absent.
- **CLI (spec §CLI):** `generate <slug> [--icon]` does load→distill→generate→write (+ the review loop that's inside `generateComponentCodeReviewed`); `doctor`/`--help` run no-env — Task 5.
- **Boundary (spec §Scope):** no real tsc/Playwright/vision loop, no git/PR — those are explicitly deferred to Phase 3 in the README + Task 5.
- **Generality:** no per-component branching anywhere; naming from slug (`paths`), values from contracts (`loaders`/`prop-types`), tokens from `tokens.json` (`loaders`).
- **figmaFileKey gap:** the spec's CLI step 1 needs the component's file key; the manifest didn't carry one — Task 6 adds `figmaFileKey` to the manifest (+ `FIGMA_FILE_KEY` env override), a general data-driven source. Flagged as a small addition to the conventions.
```
