# Figma-sync: orphan reconcile-delete (#2) + change-detection (#6) — design

Two deferred Figma-sync items, built together because both touch the same
`sync` write path and the manifest schema. Scope was cut with the user: items
#1 (full-file-walk fallback) and #5 (Cyrillic transliteration) are dropped as
YAGNI/moot (the fast path is deliberately fallback-free; the DS library has no
non-latin component names — Cyrillic was a *screen*-name problem in the retired
ai-tools-app mockup feature). #3/#4 deferred again.

Current sync architecture (verified): `runSync` (pure, Figma I/O injected) →
`writeSync` (persist to disk), wired by `cli.ts`. Enumeration is library
endpoints only (`/components`, `/component_sets`, `/styles`); curation in
`sync-curate.ts`; writes in `loaders.ts` (manifest, `tokens/tokens.json`,
per-slug `<slug>.contract.json`). Deletion today is a separate manual
`codegen delete <slug>` (`delete.ts`). Sync only adds/updates.

---

## Item #2 — Orphan reconcile-delete during sync

### Problem
When a component disappears from the curated Figma set, `writeSync` overwrites
the manifest wholesale so the *entry* drops out, but the on-disk **component
directory, its `<slug>.contract.json`, and its barrel export line are left
behind** as orphans. Library churn accumulates dead files.

### Solution (conservative — never deletes real code)
Add a reconcile step to `writeSync` that classifies orphans and only auto-removes
the safe ones.

- **Orphan** = a slug in the OLD on-disk manifest but absent from the NEW curated
  result (across both `components` and `icons`). `writeSync` must read the old
  manifest **before** overwriting it.
- **Classification per orphan:**
  - **Seed-only → auto-remove.** The slug was synced but never generated: no
    generated source file on disk (only a seed `<slug>.contract.json`). Remove the
    directory + barrel line. Harmless — it was never real code.
  - **Committed → protect + report.** A generated source file exists on disk
    (`<Identifier>.tsx`). Do NOT auto-delete (that would silently destroy
    LLM-generated, possibly composed-into code). Collect into
    `orphanedCommitted: string[]`, return it in `SyncResult`, and the CLI prints a
    warning: "gone from Figma but has committed code — run `codegen delete <slug>`
    if intended."
- **"Has generated code"** = the component's generated `.tsx` exists on disk (via
  `componentSourcePaths`). Applies to icons too: a committed icon (real SVG
  component file) is protected and reported, only never-generated icon seeds
  auto-remove.

### Safety
- SAFETY INVARIANT 1 (throw on 0 components + 0 icons) already fires *before*
  `writeSync`, so a total-wipe fetch never reaches reconcile.
- Auto-removal only ever touches **seed-only** dirs (never a generated file), so
  even a buggy partial curation can at most delete never-generated seeds — low
  blast radius. Real code always requires the explicit `codegen delete`.

### Code shape
- New pure module `sync-reconcile.ts`:
  `findOrphans(oldManifest, newResult, hasGeneratedCode) → { removable: {slug,isIcon}[], committed: string[] }`.
  `hasGeneratedCode(slug,isIcon)` injected (fs check) so it's unit-testable with fakes.
- Refactor `delete.ts`: extract `removeComponentFiles(root, slug, isIcon)` (dir +
  barrel line, no manifest edit). `deleteComponent` calls it (behavior byte-identical);
  the reconcile step calls it for each `removable`.
- `writeSync` (`sync.ts`): read old manifest → compute orphans → remove removable →
  thread `orphanedCommitted` into the returned `SyncResult`. `cli.ts` summary prints
  the warning line when non-empty.

---

## Item #6 — Change-detection (Figma-changed committed component → regen), full + admin badge

### Problem
Nothing records which Figma version a component was generated from, so a
component whose Figma design changed after it was generated silently stays stale.
No way to flag "regenerate me."

### Solution — derived, self-correcting staleness
Two timestamps, staleness derived from their mismatch (no stored boolean to keep
in sync; regeneration self-clears it):

1. **Manifest records current Figma mod time.** Extend `ManifestEntry` with
   `figmaUpdatedAt?: string` (ISO). The Figma REST `/components` and
   `/component_sets` responses carry `updated_at` per published node; thread it
   through curation into each group (for a multi-node variant set, use the
   **latest** `updated_at` among its nodes). `writeManifest` persists it.
2. **Generation stamps what it built from.** When `codegen generate <slug>`
   writes the contract, copy the manifest entry's current `figmaUpdatedAt` into
   the contract → `ComponentContractFile.figmaUpdatedAt?: string`. This records
   "the Figma version this code was generated from."
3. **Derive staleness.** A component is **stale** iff it has generated code AND
   `contract.figmaUpdatedAt` is set AND it differs from the manifest entry's
   current `figmaUpdatedAt`. Pure helper `staleComponents(manifest, contracts)`
   in codegen, reused by admin.

### Scope guards / edge cases
- **Components only.** Icons are deterministic SVG exports (no LLM, cheap to
  re-sync); a stale icon self-heals on next sync/generate — no badge for icons.
- **No false positives on legacy code:** a contract with no `figmaUpdatedAt`
  (generated before this feature) is NOT stale — flag only when both sides are
  present and differ.
- Manifest entry missing `figmaUpdatedAt` (Figma didn't return it) → not stale.

### Admin badge
The admin already reads repo files (manifest + `<slug>.contract.json`) to derive
component status. Add the `staleComponents` derivation and render a **"Figma
changed → regenerate"** badge on stale committed components on the dashboard rows
and the `/review/<slug>` page. The badge disappears automatically after
regeneration re-stamps the contract.

### Code shape
- `figma.ts`: capture `updated_at` in the component/component-set fetch result types.
- `sync-curate.ts` / `sync.ts`: thread `figmaUpdatedAt` per curated group (latest
  among nodes) into the result → manifest entries.
- `loaders.ts`: `ManifestEntry.figmaUpdatedAt?`, `ComponentContractFile.figmaUpdatedAt?`;
  `writeManifest` writes it, `writeSeedContract` preserves it on merge.
- generate path (`component.ts` / cli `generate`): stamp `figmaUpdatedAt` from the
  manifest into the contract on a successful generate.
- New pure helper `staleComponents` (in `sync-reconcile.ts` or a small
  `change-detection.ts`).
- admin: status derivation + badge (dashboard + review page).

---

## Testing
Codegen has a committed `node:test` suite (`packages/codegen/test/*.test.ts`, run
`pnpm test`, 62 cases). Add:
- `sync-reconcile.test.ts`: `findOrphans` classification (seed-only vs committed,
  components + icons, empty/no-op); `removeComponentFiles` (dir + barrel, leaves
  siblings); reconcile threads `orphanedCommitted`.
- change-detection: `staleComponents` (stale on mismatch, not-stale on
  legacy/no-stamp/equal/icon); manifest+contract round-trip of `figmaUpdatedAt`.
Deterministic gates + `tsc --noEmit` + `pnpm build` (codegen and admin) are the truth.

## Non-goals
- No full-file-walk fallback (#1), no Cyrillic transliteration (#5), no partial
  resync (#3), no progress streaming (#4).
- Reconcile never auto-deletes committed code — only seed-only orphans.
- Change-detection is components-only; icons self-heal.

## Verify
`pnpm test` (codegen) green incl. new fixtures; `tsc --noEmit` + `pnpm build`
green in both `packages/codegen` and `apps/admin`. Manual sanity: a removed
seed-only slug's dir/barrel vanish on next sync while a committed orphan is only
reported; a manifest `figmaUpdatedAt` bump on a committed component lights the
admin badge, which clears after regenerate.
