# Figma Metadata Sync (core CLI) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A `codegen sync` command that reads the Figma library, curates it (~30 components + ~300 icons), harvests tokens, and writes the git-state files (manifest + tokens.json + tokens.css + seed `<slug>.contract.json` per component) — populating the inventory that generation needs.

**Architecture:** Port the metadata sync from `ai-tools-app/src/lib/figma/sync.ts` (DB-bound) into `packages/codegen` (git-files), fast-path only. Pure curation + token-resolver logic is unit-tested; all Figma I/O is injected. Manifest + tokens.json are regenerated wholesale with a non-empty abort guard; seed contracts preserve an existing generated `contract` block. Reuses Phase-2 ports: `figma.ts`, `token-derive.ts`, `tokens.ts`, `paths.ts`, `loaders.ts`.

**Tech Stack:** TypeScript 5.9 (ESM), Node 22, `tsx`/`node:test`, the `ai`/`zod`-free pure modules + `figma.ts` client. No new deps.

## Global Constraints

- **Spec:** `design-system/docs/design-system-admin/phase-figma-sync.md` — source of truth (incl. its **Deferred** section — do NOT build those).
- **Port source:** `/Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app/src/lib/figma/sync.ts` (`AT` = that repo). COPY the pure logic (curation, token resolvers) with coupling stripped; do NOT delete from `ai-tools-app`.
- **Branch:** `figma-sync`, off `master` (pull first). NEVER commit to master; NEVER `git add -A`.
- **Locked decisions:** fast path only (no full-file-walk fallback); manifest+tokens.json regenerated **wholesale** with a **non-empty abort guard** (empty curated result → throw, write nothing); seed `<slug>.contract.json` **preserves** an existing `contract` block (props/cssVariables/classNames), only updates metadata (name/isIcon/figmaNodeIds/variants/states); **no reconcile-delete** of orphaned dirs; output to the working tree (human commits/PRs).
- **tokens.json shape stays `{ name: { category, value } }`** (matches the existing `loadTokens`/`generateTokensCss` contract — a `derived`/`figmaNodeId`/`description` field is NOT added in v1, since it only mattered for the deferred token reconcile).
- **Reuse (do not reimplement):** `figmaGet`/`FIGMA_FILE_FETCH_TIMEOUT_MS`/`getFigmaAccessToken` (`./figma`); `slugify`/`componentSourcePaths` (`./paths`); `generateTokensCss`/`toCssVarName`/`type TokenForCss` (`./tokens`); `deriveTokensFromComponents` (`./token-derive`); `loadManifest`/`loadComponentContract`/`type Manifest`/`ManifestEntry`/`ComponentContractFile`/`findRepoRoot` (`./loaders`); `type DesignComponentVariant`/`DesignComponentState`/`DesignTokenCategory` (`./types`).
- **Injected I/O:** `runSync` takes its Figma calls as injected deps so it's unit-tested with a fake library payload (no network).
- **Discipline:** GENERAL (curation by rule, no hardcoded component names). English only. `corepack pnpm`. `cd` the repo dir each shell call.
- **Ports keep names/logic:** the curation (`isCuratedComponentName`/`isLikelyIconName`/`parseVariantName`/`buildComponentGroups`/`uniqueSlug`) and the token-Style resolvers (`STYLE_TYPE_TO_CATEGORY`/`resolveFill|Text|EffectValue`/`rgbaToCss`) are faithful ports — copy the logic, strip `server-only`/`@/db`/drizzle, keep behavior identical.
- **Out of scope (Deferred — see spec):** sync.yml workflow + admin button, full-file-walk fallback, reconcile-delete, partial resyncs, progress streaming, transliteration, change-detection.

## File Structure

```
packages/codegen/src/
  figma.ts          MODIFY — getFileComponents / getFileComponentSets / getFileStyles + types
  sync-curate.ts    NEW — pure: marker/icon/variant/group/slug (port of buildComponentGroups & co)
  sync-tokens.ts    NEW — pure: Figma-Style resolvers (FILL/TEXT/EFFECT → TokenForCss)
  sync.ts           NEW — runSync (injected I/O) + writeSync
  loaders.ts        MODIFY — writeManifest / writeTokens / writeSeedContract helpers
  cli.ts            MODIFY — `sync` command + HELP + doctor line
  index.ts          MODIFY — export sync/sync-curate/sync-tokens
packages/codegen/test/
  sync-curate.test.ts   NEW
  sync-tokens.test.ts   NEW
  sync-write.test.ts    NEW (writeSync + loaders write helpers, temp dir)
  sync-run.test.ts      NEW (runSync with injected fetch)
```

---

## Task 1: Figma library-list endpoints (`figma.ts`)

**Files:** branch + spec commit; MODIFY `packages/codegen/src/figma.ts`.

**Interfaces:** Produces `getFileComponents`, `getFileComponentSets`, `getFileStyles` + types `FigmaLibComponent`, `FigmaLibStyle`.

- [ ] **Step 1: Branch + commit the spec**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git checkout master && git pull --ff-only
git checkout -b figma-sync
git add docs/design-system-admin/phase-figma-sync.md
git commit -m "docs(figma-sync): metadata sync (core CLI) spec

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

- [ ] **Step 2: Append the list endpoints to `figma.ts`** (reuse `figmaGet` + `FIGMA_FILE_FETCH_TIMEOUT_MS`)

```ts
export interface FigmaLibComponent {
  node_id: string;
  name: string;
  description?: string;
  containing_frame?: { pageName?: string };
}
export interface FigmaLibStyle {
  node_id: string;
  style_type: string; // FILL | TEXT | EFFECT | GRID
  name: string;
  description?: string;
}
interface FigmaComponentsResponse { meta?: { components?: FigmaLibComponent[] } }
interface FigmaComponentSetsResponse { meta?: { component_sets?: FigmaLibComponent[] } }
interface FigmaStylesResponse { meta?: { styles?: FigmaLibStyle[] } }

/** Published-library components. 55s budget (large libraries are slow); THROWS
 *  on failure (never swallow -- a slow list must surface, not silently yield an
 *  empty inventory). */
export async function getFileComponents(fileKey: string, accessToken: string): Promise<FigmaLibComponent[]> {
  const res = await figmaGet<FigmaComponentsResponse>(`/files/${fileKey}/components`, accessToken, FIGMA_FILE_FETCH_TIMEOUT_MS);
  return res.meta?.components ?? [];
}
export async function getFileComponentSets(fileKey: string, accessToken: string): Promise<FigmaLibComponent[]> {
  const res = await figmaGet<FigmaComponentSetsResponse>(`/files/${fileKey}/component_sets`, accessToken, FIGMA_FILE_FETCH_TIMEOUT_MS);
  return res.meta?.component_sets ?? [];
}
/** Published-library styles (tokens). Default (shorter) timeout; the caller may
 *  fail-soft (tokens are optional). */
export async function getFileStyles(fileKey: string, accessToken: string): Promise<FigmaLibStyle[]> {
  const res = await figmaGet<FigmaStylesResponse>(`/files/${fileKey}/styles`, accessToken);
  return res.meta?.styles ?? [];
}
```

- [ ] **Step 3: Typecheck + commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
git add packages/codegen/src/figma.ts
git commit -m "feat(codegen): Figma library-list endpoints (components/component_sets/styles)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 2: Curation (pure) — `sync-curate.ts` + fixtures

**Files:** NEW `packages/codegen/src/sync-curate.ts`; NEW `packages/codegen/test/sync-curate.test.ts`.

**Interfaces:** Produces `isCuratedComponentName`, `isLikelyIconName`, `parseVariantName`, `buildComponentGroups`, `uniqueSlug`, `type ResolvedComponentGroup`, `type RawComp`.

Port the pure curation logic from `AT/src/lib/figma/sync.ts` (functions `isCuratedComponentName`, `stripCurationMarker`, `isLikelyIconName`, `parseVariantName`, `buildComponentGroups`/`mergeIn`, `uniqueSlug`, `slugKeyFor`). Strip `server-only`/`@/db`/drizzle; import `slugify` from `./paths`, types from `./types`. Keep the logic identical (see the spec's Part B for the exact rules).

- [ ] **Step 1: Write the failing test `packages/codegen/test/sync-curate.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { isCuratedComponentName, isLikelyIconName, parseVariantName, buildComponentGroups, uniqueSlug } from "../src/sync-curate";

test("isCuratedComponentName: 🟢 and no slash", () => {
  assert.equal(isCuratedComponentName("🟢 Avatar"), true);
  assert.equal(isCuratedComponentName("🟢 Avatar/Dark/40 px"), false); // published variant dupe
  assert.equal(isCuratedComponentName("Avatar"), false);               // not marked
});

test("isLikelyIconName: page 'Icons' OR /-taxonomy (but not =)", () => {
  assert.equal(isLikelyIconName("Plus", "Icons"), true);
  assert.equal(isLikelyIconName("Outline/Bold/Plus", undefined), true);
  assert.equal(isLikelyIconName("Size=Large", "Components"), false);   // = → variant, not icon
  assert.equal(isLikelyIconName("Button", "Components"), false);
});

test("parseVariantName: key=value pairs, or null", () => {
  assert.deepEqual(parseVariantName("Size=Large, State=Hover"), [{ key: "Size", value: "Large" }, { key: "State", value: "Hover" }]);
  assert.equal(parseVariantName("Just A Name"), null);
});

test("uniqueSlug dedupes with -2/-3", () => {
  const taken = new Set<string>(["tooltip"]);
  assert.equal(uniqueSlug("tooltip", taken), "tooltip-2");
});

test("buildComponentGroups: curates + merges same-name + slugs", () => {
  const groups = buildComponentGroups(
    /* sets */ [{ node_id: "1:1", name: "🟢 Button", containing_frame: { pageName: "Components" } }],
    /* comps */ [
      { node_id: "2:1", name: "Outline/Plus", containing_frame: { pageName: "Icons" } },
      { node_id: "3:1", name: "Deprecated/Old", containing_frame: { pageName: "Junk" } }, // not 🟢, not icon → dropped
    ],
  );
  const button = groups.find((g) => g.slug === "button");
  assert.ok(button && !button.isIcon);
  const plus = groups.find((g) => g.isIcon);
  assert.ok(plus && plus.slug.length > 0);
  assert.equal(groups.find((g) => g.name.includes("Deprecated")), undefined);
});
```

- [ ] **Step 2: RED**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/sync-curate.test.ts
```
Expected: FAIL — `Cannot find module '../src/sync-curate'`.

- [ ] **Step 3: Write `sync-curate.ts`** — port the functions named above from `AT/src/lib/figma/sync.ts`, coupling stripped. `buildComponentGroups(sets, comps)` signature: takes the two raw arrays (`RawComp[]` = the `FigmaLibComponent` shape from `figma.ts`, plus set-variant-children resolution is done by the caller in Task 4 — for the pure function, accept each raw entry's own `node_id`/`name`/`pageName`, and let the caller pass set-variant nodeIds in). Returns `ResolvedComponentGroup[]` = `{ slug, name, description?, variants: {name,description?}[], states: {name,description?}[], figmaNodeIds: string[], isIcon }`. Keep `slugify`+`uniqueSlug` slugging and `stripCurationMarker` on the name.

Note: the pure `buildComponentGroups` here works over the LIST data (node_id, name, pageName). Resolving a component SET's variant children (extra nodeIds + variant labels via `nodes?depth=1`) is I/O — done in Task 4's `runSync`, which passes the resolved variant info in. Design the signature so the variant/state extraction from an already-fetched set is a separate pure helper the runner calls, OR accept an optional `variantsBySetId` map. Keep it faithful to the source's split.

- [ ] **Step 4: GREEN + typecheck**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/sync-curate.test.ts
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
```
Expected: tests pass; tsc clean. (Adjust an assertion to the real ported output if it differs — never weaken the port.)

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/sync-curate.ts packages/codegen/test/sync-curate.test.ts
git commit -m "feat(codegen): port Figma curation (🟢 filter, icon detection, group/slug)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 3: Token-Style resolvers (pure) — `sync-tokens.ts` + fixtures

**Files:** NEW `packages/codegen/src/sync-tokens.ts`; NEW `packages/codegen/test/sync-tokens.test.ts`.

**Interfaces:** Produces `STYLE_TYPE_TO_CATEGORY`, `rgbaToCss`, `resolveFillValue`, `resolveTextValue`, `resolveEffectValue`, `resolveStyleToken(style, node): TokenForCss | null`.

Port from `AT/src/lib/figma/sync.ts` the pure style resolvers (`STYLE_TYPE_TO_CATEGORY`, `rgbaToCss`, `resolveFillValue`, `resolveTextValue`, `resolveEffectValue` and the glue that maps a style + its resolved node to a token). Import `type TokenForCss` from `./tokens`, `type DesignTokenCategory` from `./types`. GRID unmapped → skip. Unresolvable value → return null (caller counts skipped).

- [ ] **Step 1: Write the failing test `packages/codegen/test/sync-tokens.test.ts`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { rgbaToCss, resolveFillValue, resolveTextValue, STYLE_TYPE_TO_CATEGORY } from "../src/sync-tokens";

test("STYLE_TYPE_TO_CATEGORY maps FILL/TEXT/EFFECT, skips GRID", () => {
  assert.equal(STYLE_TYPE_TO_CATEGORY.FILL, "color");
  assert.equal(STYLE_TYPE_TO_CATEGORY.TEXT, "typography");
  assert.equal(STYLE_TYPE_TO_CATEGORY.EFFECT, "shadow");
  assert.equal(STYLE_TYPE_TO_CATEGORY.GRID, undefined);
});

test("rgbaToCss: hex when opaque, rgba otherwise", () => {
  assert.equal(rgbaToCss({ r: 0, g: 0, b: 0, a: 1 }), "#000000");
  assert.match(rgbaToCss({ r: 1, g: 1, b: 1, a: 0.5 }), /^rgba\(/);
});

test("resolveFillValue: first visible SOLID → css color; none → null", () => {
  assert.equal(resolveFillValue({ fills: [{ type: "SOLID", visible: true, color: { r: 0, g: 0, b: 0 }, opacity: 1 }] }), "#000000");
  assert.equal(resolveFillValue({ fills: [] }), null);
});

test("resolveTextValue: weight/size/lineHeight/family string", () => {
  const v = resolveTextValue({ style: { fontWeight: 400, fontSize: 16, lineHeightPx: 22, fontFamily: "Inter" } });
  assert.equal(v, "400 16px/22px Inter");
});
```

- [ ] **Step 2: RED → implement `sync-tokens.ts` (port) → GREEN**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/sync-tokens.test.ts   # RED first
# implement sync-tokens.ts (port the resolvers), then:
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/sync-tokens.test.ts
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
```
Expected: RED (module missing) then GREEN; tsc clean. (Adjust assertions to the real ported output if the exact string/format differs — the source is the authority, keep it faithful.)

- [ ] **Step 3: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/sync-tokens.ts packages/codegen/test/sync-tokens.test.ts
git commit -m "feat(codegen): port Figma-Style token resolvers (fill/text/effect → TokenForCss)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Task 4: `runSync` + `writeSync` + loaders write helpers

**Files:** MODIFY `packages/codegen/src/loaders.ts` (write helpers); NEW `packages/codegen/src/sync.ts`; NEW `packages/codegen/test/sync-write.test.ts` + `test/sync-run.test.ts`.

**Interfaces:**
- `loaders.ts`: `writeManifest(manifest, root)`, `writeTokensJson(tokens: TokenForCss[], root)` (writes `{name:{category,value}}` + regenerates `packages/components/src/tokens/tokens.css` via `generateTokensCss`), `writeSeedContract(entry, root)` (merges into an existing `<slug>.contract.json`, preserving its `contract` block).
- `sync.ts`: `runSync(args): Promise<SyncResult>` (injected Figma I/O) where `SyncResult = { components: ManifestEntry[]; icons: ManifestEntry[]; contracts: ComponentContractFile[]; tokens: TokenForCss[]; tokensSkipped: number }`; `writeSync(result, root): string[]`.

- [ ] **Step 1: Add write helpers to `loaders.ts`**

```ts
import { generateTokensCss, type TokenForCss } from "./tokens";
// (existing imports already cover fs/path, Manifest, ComponentContractFile, componentSourcePaths)

const TOKENS_CSS_REL = join("packages", "components", "src", "tokens", "tokens.css");

export function writeManifest(manifest: Manifest, root: string = findRepoRoot()): void {
  writeFileSync(join(root, MANIFEST_FILE), JSON.stringify(manifest, null, 2) + "\n");
}

/** Wholesale-write tokens.json ({name:{category,value}}) + regenerate tokens.css. */
export function writeTokensJson(tokens: TokenForCss[], root: string = findRepoRoot()): void {
  const obj: Record<string, { category: string; value: string }> = {};
  for (const t of tokens) obj[t.name] = { category: t.category, value: t.value };
  writeFileSync(join(root, TOKENS_FILE), JSON.stringify(obj, null, 2) + "\n");
  const cssPath = join(root, TOKENS_CSS_REL);
  mkdirSync(dirname(cssPath), { recursive: true });
  writeFileSync(cssPath, generateTokensCss(tokens));
}

/** Write/merge a component's seed contract, PRESERVING an existing generated
 *  `contract` block (props/cssVariables/classNames). Only metadata is updated. */
export function writeSeedContract(entry: ComponentContractFile, root: string = findRepoRoot()): string {
  const existing = loadComponentContract(entry.slug, root);
  const merged: ComponentContractFile = { ...entry, contract: existing?.contract ?? entry.contract };
  const dir = join(root, "packages", "components", componentSourcePaths(entry.slug, entry.isIcon).dir);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${entry.slug}.contract.json`);
  writeFileSync(path, JSON.stringify(merged, null, 2) + "\n");
  return path;
}
```
(Confirm `mkdirSync`/`dirname`/`writeFileSync` are imported at the top of `loaders.ts`; add any missing.)

- [ ] **Step 2: Write `packages/codegen/test/sync-write.test.ts`** (temp dir)

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeManifest, writeTokensJson, writeSeedContract } from "../src/loaders";

function repo(): string {
  const root = mkdtempSync(join(tmpdir(), "sync-write-"));
  writeFileSync(join(root, "design-system.manifest.json"), JSON.stringify({ components: [], icons: [] }));
  mkdirSync(join(root, "tokens"), { recursive: true });
  return root;
}

test("writeTokensJson writes tokens.json + tokens.css", () => {
  const root = repo();
  writeTokensJson([{ name: "text-primary", category: "color", value: "#0a0a0a" }], root);
  const j = JSON.parse(readFileSync(join(root, "tokens/tokens.json"), "utf8"));
  assert.deepEqual(j["text-primary"], { category: "color", value: "#0a0a0a" });
  assert.ok(existsSync(join(root, "packages/components/src/tokens/tokens.css")));
});

test("writeSeedContract preserves an existing generated contract block", () => {
  const root = repo();
  const dir = join(root, "packages/components/src/components/button");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "button.contract.json"), JSON.stringify({
    name: "Button", slug: "button", isIcon: false, figmaNodeIds: ["old"],
    variants: [], states: [], contract: { props: [{ name: "variant", type: "'a'|'b'" }], cssVariables: [], classNames: ["root"] },
  }));
  writeSeedContract({
    name: "Button", slug: "button", isIcon: false, figmaNodeIds: ["1:2"],
    variants: [{ name: "Size: Large" }], states: [], contract: { props: [], cssVariables: [], classNames: [] },
  }, root);
  const c = JSON.parse(readFileSync(join(dir, "button.contract.json"), "utf8"));
  assert.deepEqual(c.figmaNodeIds, ["1:2"]);          // metadata updated
  assert.deepEqual(c.variants, [{ name: "Size: Large" }]);
  assert.equal(c.contract.props.length, 1);            // generated props PRESERVED
});
```

- [ ] **Step 3: Write `sync.ts` (`runSync` + `writeSync`)**

`runSync(args)`: `args = { fileKey, token, deps }` where `deps` injects `getComponents`/`getComponentSets`/`getStyles`/`resolveNodes` (defaulting to the real `figma.ts` calls) + `deriveTokens` (defaulting to `deriveTokensFromComponents`). Flow: fetch components+sets+styles (Promise.all; styles fail-soft); resolve set variant children via the injected `resolveNodes` (`getFileNodes …depth=1`, batched 250/conc 3) to get variant nodeIds + labels; `buildComponentGroups(...)`; **throw if `components.length + icons.length === 0`** (non-empty guard); harvest tokens = the Style tokens (`resolveStyleToken` over resolved style nodes, count skipped) + `deriveTokens(nonIconRows, fileKey, token).tokens` (derived color/radius); dedupe token names (Style wins over derived on collision). Map each group → a `ManifestEntry` (`{name,slug,isIcon,figmaNodeIds}`) split into components/icons, and a `ComponentContractFile` seed (`{name,slug,isIcon,figmaNodeIds,variants,states,contract:{props:[],cssVariables:[],classNames:[]}}`). Return `SyncResult`.

`writeSync(result, root)`: `writeManifest({ figmaFileKey: loadManifest(root).figmaFileKey, components: result.components, icons: result.icons }, root)`; `writeTokensJson(result.tokens, root)`; `writeSeedContract(...)` for each `result.contracts`. Return the written paths.

- [ ] **Step 4: Write `packages/codegen/test/sync-run.test.ts`** (injected fetch — no network)

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { runSync } from "../src/sync";

const deps = {
  getComponents: async () => [{ node_id: "2:1", name: "Outline/Plus", containing_frame: { pageName: "Icons" } }],
  getComponentSets: async () => [{ node_id: "1:1", name: "🟢 Button", containing_frame: { pageName: "Components" } }],
  getStyles: async () => [],
  resolveNodes: async () => ({}),                 // no set variant children in this fixture
  deriveTokens: async () => ({ tokens: [], colors: 0, radii: 0 }),
};

test("runSync curates into components + icons", async () => {
  const r = await runSync({ fileKey: "F", token: "figd_x", deps } as never);
  assert.equal(r.components.find((c) => c.slug === "button")?.isIcon, false);
  assert.ok(r.icons.length >= 1);
});

test("runSync aborts (throws) on an empty curated result (non-empty guard)", async () => {
  await assert.rejects(runSync({ fileKey: "F", token: "figd_x", deps: { ...deps, getComponents: async () => [], getComponentSets: async () => [] } } as never));
});
```

- [ ] **Step 5: Export + verify + commit**

Append to `index.ts`: `export * from "./sync"; export * from "./sync-curate"; export * from "./sync-tokens";` (resolve any TS2308 with explicit named re-exports).
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
corepack pnpm --filter @d-2-g-8/codegen test
```
Expected: tsc clean; all fixtures (curate + tokens + write + run + the Phase-2/3 suite) pass. Commit `loaders.ts`, `sync.ts`, `index.ts`, `test/sync-write.test.ts`, `test/sync-run.test.ts`:
`feat(codegen): runSync + writeSync (manifest/tokens/seed-contracts, non-empty guard)`.

---

## Task 5: `codegen sync` CLI + verify + docs

**Files:** MODIFY `packages/codegen/src/cli.ts`; verify; docs.

- [ ] **Step 1: Wire the `sync` command in `cli.ts`**

Add a `sync` function + dispatch (mirrors `generate`'s env resolution):
```ts
async function sync(): Promise<number> {
  const root = findRepoRoot();
  const token = getFigmaAccessToken();
  if (!token) { console.error("FIGMA_ACCESS_TOKEN is not set."); return 1; }
  const fileKey = process.env.FIGMA_FILE_KEY || loadManifest(root).figmaFileKey;
  if (!fileKey) { console.error("No Figma file key: set FIGMA_FILE_KEY or manifest.figmaFileKey."); return 1; }
  const result = await runSync({ fileKey, token });   // real deps by default
  const written = writeSync(result, root);
  console.log(`sync: ${result.components.length} components, ${result.icons.length} icons, ${result.tokens.length} tokens (${result.tokensSkipped} skipped)\n${written.length} files written`);
  return 0;
}
```
In `main`'s dispatch add `if (cmd === "sync") return sync();`. Add a `sync` line to `HELP` (`codegen sync   Read the Figma library → write manifest + tokens + seed contracts (needs FIGMA_ACCESS_TOKEN).`). `doctor` may add a "figma file key resolvable" line (already present). Keep `doctor`/`--help` no-env (the `sync` path only runs on the `sync` command).

- [ ] **Step 2: Verify (tsc + full suite + no-env help; NO live sync)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
corepack pnpm --filter @d-2-g-8/codegen test
corepack pnpm --filter @d-2-g-8/codegen build
env -u FIGMA_ACCESS_TOKEN corepack pnpm --filter @d-2-g-8/codegen exec tsx src/cli.ts --help
corepack pnpm -r typecheck
grep -m1 lockfileVersion pnpm-lock.yaml
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/ai-tools-app && git status --porcelain
```
Expected: tsc clean; full codegen suite green; tsup build ok; `--help` shows `sync` no-env; `-r typecheck` green; lockfile v9; `ai-tools-app` untouched. Do NOT run a live `codegen sync` (costs Figma calls — user-gated).

- [ ] **Step 3: Docs — the live smoke + confirm the Deferred list**

Update the spec's preconditions if needed; document the user-gated live smoke:
```bash
FIGMA_ACCESS_TOKEN=figd_... corepack pnpm --filter @d-2-g-8/codegen codegen sync
# inspect the design-system.manifest.json / tokens.json / seed contract diffs, then commit + PR
```
Confirm `SESSION-HANDOFF.md` still carries the full Deferred list (already recorded).

- [ ] **Step 4: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/cli.ts docs/design-system-admin/phase-figma-sync.md
git commit -m "feat(codegen): codegen sync command (library → manifest/tokens/seed-contracts) + docs

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XPXVhQDQ8KfivwkTRFZpSN"
```

---

## Self-Review notes (checked against the spec)

- **Coverage:** Part A (list endpoints) → Task 1; Part B (curation) → Task 2; Part C (token resolvers + derive reuse) → Task 3; Part D (runSync/writeSync) → Task 4; CLI + verify → Task 5.
- **Locked decisions:** fast-path only (no full-walk); wholesale manifest/tokens with the **non-empty abort guard** (Task 4 `runSync` throws on empty, tested); seed contracts **preserve** the `contract` block (Task 4 `writeSeedContract`, tested); no reconcile-delete; tokens.json shape unchanged `{name:{category,value}}`.
- **Injected I/O:** `runSync` deps injected → unit-tested with no network (Task 4).
- **Generality:** curation by rule, no hardcoded names. **Boundary:** the 7 Deferred items are not built (spec + handoff record them).
- **Type consistency:** `ResolvedComponentGroup`→`ManifestEntry`{name,slug,isIcon,figmaNodeIds} + `ComponentContractFile` seed; `TokenForCss`{name,category,value}; `runSync`→`SyncResult`; `deriveTokensFromComponents(rows,fileKey,token)`→`{tokens,colors,radii}`.
```
