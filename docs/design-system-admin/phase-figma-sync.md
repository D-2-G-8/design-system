# Phase — Figma metadata sync (core CLI)

Build the missing **inventory sync**: a `codegen sync` command that reads the
Figma library, **curates** it (the ~30 real components + ~300 icons), harvests
**tokens**, and writes the git-state files — `design-system.manifest.json`,
`tokens/tokens.json` (+ regenerated `tokens.css`), and a seed
`<slug>.contract.json` per component. This is what populates the manifest so the
admin lists real components and `codegen generate` can distill+generate them.

Ports the metadata sync from `ai-tools-app/src/lib/figma/sync.ts` (DB-bound) into
`packages/codegen` (git-files). Reuses the Phase-2 ports: `figma.ts`,
`token-derive.ts`, `tokens.ts` (`generateTokensCss`/`toCssVarName`), `paths.ts`
(`slugify`), `loaders.ts`. Source-of-truth docs: `architecture.md`,
`conventions.md`, `phase2-port-core.md`.

## Why this exists (the gap this closes)

`codegen generate` (Phase 2) distills a component's Figma node — but only for a
component ALREADY in the manifest with real `figmaNodeIds`. Today the manifest is
seed data (one Button, empty node ids). Nothing populates the real library. The
per-component distill exists; the **library inventory sync does not** — it still
lives only in `ai-tools-app` (writing its own DB, disconnected from this repo).
This phase builds it here. It must land **before Phase 6 cutover** (you can't
retire ai-tools-app while it's the only thing that can sync the Figma inventory).

## Locked decisions (settled with the user)

1. **Scope = core CLI first.** `codegen sync` reads Figma → curates → writes the
   files into the working tree. The PR delivery (`sync.yml` workflow + admin
   "Sync from Figma" button) is a deferred follow-up (see Deferred).
2. **Manifest + tokens.json regenerated wholesale** each sync (matches
   `conventions.md`), WITH a **non-empty guard**: if the curated component list is
   empty (a transient Figma read failure), the sync **aborts** rather than writing
   an empty manifest (ports the reconcile non-empty invariant).
3. **Seed contracts merged, never clobbered.** A synced component's
   `<slug>.contract.json` gets its metadata fields (name/isIcon/figmaNodeIds/
   variants/states) written/updated, but an existing generated `contract` block
   (props/cssVariables/classNames) is PRESERVED. Orphaned component dirs (removed
   from Figma) are NOT deleted (a human/cutover decision — see Deferred).
4. **Fast path only.** The three published-library list endpoints. The full-file-
   walk fallback (~52MB, for non-published-library files) is deferred.
5. **Output to the working tree; the human commits/PRs.** Automated PR delivery is
   deferred.

## Architecture / data flow

```
codegen sync   (env: FIGMA_ACCESS_TOKEN, FIGMA_FILE_KEY ?? manifest.figmaFileKey)
   │
   ├─ GET /files/<key>/components  (55s) ─┐
   ├─ GET /files/<key>/component_sets(55s)├─ Promise.all  → raw published entries + pageName
   ├─ GET /files/<key>/styles      (20s) ─┘  (styles fail-soft → tokens optional)
   ├─ getFileNodes/…?ids=…&depth=1  (batched 250, conc 3) → set variant children + fills
   │
   ├─ CURATE (buildComponentGroups): 🟢-and-no-"/" components; isLikelyIconName icons;
   │          merge same-name; slugify + uniqueSlug  → { components[], icons[] }
   ├─ ABORT if components+icons is empty (non-empty guard)
   ├─ HARVEST TOKENS: Figma Styles (FILL/TEXT/EFFECT) + deriveTokensFromComponents (color/radius)
   ▼
   WRITE (git = state):
     design-system.manifest.json        ← { figmaFileKey, components[], icons[] }  (wholesale)
     tokens/tokens.json                 ← { name: {category, value, description?, figmaNodeId?, derived?} }  (wholesale)
     packages/components/src/tokens/tokens.css  ← generateTokensCss(tokens)
     packages/components/src/{components|icons}/<slug>/<slug>.contract.json  ← seed metadata, PRESERVE existing contract block
   Print a summary (components, icons, tokensUpserted, tokensSkipped). Exit 0; non-zero on hard error/abort.
```

## Part A — Figma library-list endpoints (`packages/codegen/src/figma.ts`)

`figma.ts` (Phase-2 port) has `figmaGet`/`getFileNodes`/`getFileNodesShallow`/
`getFileImages` but NOT the library-list endpoints. Add (built on `figmaGet`):
- `getFileComponents(fileKey, token): Promise<FigmaLibComponent[]>` — `GET
  /files/<key>/components` (55s) → `meta.components[]` = `{ node_id, name,
  description, containing_frame?: { pageName?: string } }`.
- `getFileComponentSets(fileKey, token): Promise<FigmaLibComponentSet[]>` — `GET
  /files/<key>/component_sets` (55s) → `meta.component_sets[]` (same shape).
- `getFileStyles(fileKey, token): Promise<FigmaLibStyle[]>` — `GET
  /files/<key>/styles` (20s) → `meta.styles[]` = `{ node_id, style_type, name,
  description }`.
Keep the 55s budget on the component/set lists (throw an actionable message on
failure — never swallow-to-null, per the `libraryFetchFailureMessage` lesson);
styles may fail-soft (tokens optional).

## Part B — Curation + grouping (pure, `packages/codegen/src/sync-curate.ts`)

Port the pure decision logic (no I/O), unit-tested:
- `CURATION_MARKER = "🟢"`; `stripCurationMarker(name)`; `isCuratedComponentName(name)`
  = `startsWith("🟢")` AND stripped name has no `"/"`.
- `isLikelyIconName(name, pageLabel?)` = `pageLabel` matches `/\bicons?\b/i`, OR
  (`name.includes("/")` AND `!name.includes("=")`).
- `parseVariantName(name)` → `{ key, value }[] | null` (split `,`, each on first
  `=`; null if any part lacks `=`).
- `buildComponentGroups(rawSets, rawComponents)` → merge same-name (key =
  `name.trim()`; union variants/states/`figmaNodeIds`, `isIcon ||=`,
  `description ||=`), filter to `isIcon || isCuratedComponentName`, then assign
  `slug = uniqueSlug(slugify(cleanName))`, `name = stripCurationMarker(name)`.
  Returns `ResolvedComponentGroup[]` = `{ slug, name, description?, variants:
  {name, description?}[], states: {name, description?}[], figmaNodeIds: string[],
  isIcon }` (nodeIds: `[setNodeId, ...variantChildIds]` for a set; `[nodeId]`
  standalone; `[0]` is primary). Variant labels formatted `"${key}: ${value}"`;
  states = variant pairs whose key matches `/state/i` (bare value).
- `uniqueSlug(base, taken: Set)` → dedupe suffix `-2`,`-3`… .

## Part C — Token harvest (`packages/codegen/src/sync-tokens.ts` + reuse)

- Port the Figma-**Styles** resolvers (pure over a resolved node): `STYLE_TYPE_TO_CATEGORY
  = { FILL: "color", TEXT: "typography", EFFECT: "shadow" }` (GRID skipped);
  `resolveFillValue` (first visible SOLID → `rgbaToCss`), `resolveTextValue`
  (`"${weight} ${size}px/${lh}px ${family}"`), `resolveEffectValue` (`"[inset ]
  ${x}px ${y}px ${blur}px ${rgba}"`). Unresolvable → skip (count).
- Reuse the ported **`deriveTokensFromComponents(rows, fileKey, token)`**
  (Phase 2) for derived color/radius tokens (mark `derived: true`); rows = the
  non-icon synced components' `figmaNodeIds[0]`.
- Merge into one `TokenForCss[]`-plus-`derived` map keyed by token name.

## Part D — The `sync` orchestrator (`packages/codegen/src/sync.ts`) + CLI

- `runSync({ fileKey, token, deps }): Promise<SyncResult>` — fetch (Part A) →
  resolve set variant children via `getFileNodes …depth=1` (batched 250, conc 3)
  → `buildComponentGroups` → **abort if empty** → harvest tokens (Part C) → return
  `{ components, icons, tokens, tokensSkipped }` (in-memory; all I/O injected so
  it's unit-testable without network).
- `writeSync(result, root)` (in `loaders.ts` or `sync.ts`): write the manifest
  (wholesale), `tokens/tokens.json` (wholesale) + `tokens.css`
  (`generateTokensCss`), and per component a merged seed `<slug>.contract.json`
  (metadata updated, existing `contract` block preserved via
  `loadComponentContract` read-merge). `SyncResult` counts printed.
- **CLI**: `codegen sync` — resolve fileKey (`FIGMA_FILE_KEY ?? manifest.figmaFileKey`)
  + token (`getFigmaAccessToken`); `runSync` → `writeSync`; print summary; exit 0
  (non-zero on a hard error or the empty-abort). `doctor`/`--help` gain the
  `sync` usage; still no-env.

## Testing

- **Curation (Part B), pure**: fixtures — 🟢-simple kept, 🟢-with-`/` dropped,
  non-🟢 non-icon dropped; icon via page "Icons" and via `/`-taxonomy (but `=` →
  not icon); same-name merge unions nodeIds/variants; `parseVariantName`
  key=value / state / whole-name; slug + uniqueSlug dedupe.
- **Token resolvers (Part C), pure**: FILL→color rgba, TEXT→typography string,
  EFFECT→shadow, GRID skipped, unresolvable → skipped-count.
- **`writeSync` (temp dir)**: manifest + tokens.json + tokens.css written;
  seed contract created for a new component; an EXISTING contract's `contract`
  block (props) PRESERVED while metadata updated; the empty-guard aborts (no file
  written) on an empty result.
- **`runSync` (injected fetch)**: end-to-end with a fake library payload →
  correct components/icons/tokens, no network.
- `tsc` clean; full codegen suite green; `codegen doctor`/`--help` run no-env.
- A live `codegen sync` against the real WhaleUI2B library is **user-gated**
  (costs Figma calls) — the documented smoke.

## Preconditions for a live run (ops — user)

- `FIGMA_ACCESS_TOKEN` (a `figd_` PAT with library read) + the file key (already
  seeded in the manifest as `figmaFileKey = OcaHeBKMqemoZZt2C5z0wd`, or
  `FIGMA_FILE_KEY` env).
- Run `codegen sync` from a repo checkout; inspect the manifest/tokens diff; commit + PR.
  This is **user-gated** (it costs real Figma API calls) — not run automatically by
  any agent/CI step in this phase:

  ```bash
  FIGMA_ACCESS_TOKEN=figd_... corepack pnpm --filter @d-2-g-8/codegen codegen sync
  # inspect the design-system.manifest.json / tokens.json / tokens.css / seed
  # <slug>.contract.json diffs, then commit + PR
  ```

## ⚠️ Deferred — NOT in this phase (recorded so it isn't lost)

1. **PR delivery** — a `sync.yml` GitHub Actions workflow that runs `codegen sync`
   and opens a PR (`sync/figma` branch, peter-evans), and an admin **"Sync from
   Figma"** button that `workflow_dispatch`es it + shows progress (mirrors the
   generate machinery in `generate.yml` + `app/actions.ts`).
2. **Full-file-walk fallback** (`GET /files/<key>` whole tree, ~52MB) for
   non-published-library files — v1 is fast-path only (errors clearly if the
   library isn't published).
3. **Reconcile-delete** of orphaned `<slug>.contract.json` + component dirs for
   components removed from Figma (v1 regenerates the manifest wholesale so they
   drop from the inventory, but their files stay until a human/cutover removes them).
4. **Partial resyncs** — `resyncComponentFromFigma` (one component), and
   tokens-only / components-only resyncs (`resyncTokensFromFigma` /
   `resyncComponentsFromFigma`).
5. **Progress streaming** (SSE `onProgress`/`SyncProgressEvent`) — the CLI
   degrades to console logging; the admin's live progress bar is part of #1.
6. **Cyrillic / transliteration** for slugs — non-Latin names collapse to the
   `slugify` fallback (`component`) + `uniqueSlug` `-2/-3`; a real transliteration
   pass is deferred.
7. **Change-detection vs generated state** — a Figma-changed but already-committed
   component isn't auto-flagged for regeneration; the manifest/contract-metadata
   diff in the (deferred) sync PR is the signal, and regeneration stays a separate
   generate action.

## Ordered outline (for the plan)

1. `figma.ts` library-list endpoints (`getFileComponents`/`getFileComponentSets`/
   `getFileStyles`) + types.
2. `sync-curate.ts` (pure: marker/icon/variant/group/slug) + fixtures.
3. `sync-tokens.ts` (pure Styles resolvers) + fixtures; wire the ported
   `deriveTokensFromComponents`.
4. `sync.ts` `runSync` (injected I/O) + `writeSync` (manifest/tokens.json/
   tokens.css/seed-contract merge, empty-guard) + fixtures.
5. `cli.ts` `sync` command (+ doctor/help) ; verify (tsc + fixtures + no-env) +
   docs. Record the Deferred list in SESSION-HANDOFF.
