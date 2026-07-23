# Figma-sync reconcile-delete (#2) + change-detection (#6) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sync auto-removes orphaned seed-only components (never touching committed code) and flags committed components whose Figma design changed since generation, surfaced as an admin "Figma changed → regenerate" badge.

**Architecture:** Two features on the same `sync` write path + manifest schema. #2 adds an orphan-reconcile step to `writeSync` (reusing extracted `delete.ts` cleanup); it only auto-deletes never-generated seeds and reports committed orphans. #6 records the current Figma `updated_at` per component in the manifest and stamps the generated-from `updated_at` in each contract; staleness is derived (they differ) and self-clears on regen. Admin (GitHub-REST reads, no codegen import) re-derives staleness and renders the badge.

**Tech Stack:** TypeScript, Node `node:test` + `tsx --test` (codegen: `packages/codegen/test/*.test.ts`, 62 cases; admin: `apps/admin/test/*.test.ts`), Next.js (admin), pnpm workspace.

## Global Constraints

- Work only in `design-system/` (monorepo). Use `corepack pnpm` (bare pnpm is v8 and corrupts the lockfile).
- `cd` the repo explicitly in every bash call (cwd resets between shells).
- Codegen truth: `pnpm --filter @d-2-g-8/codegen test` + `pnpm --filter @d-2-g-8/codegen exec tsc --noEmit` green.
- Admin truth: `pnpm --filter @d-2-g-8/design-system-admin test` + `... run typecheck` + `AUTH_SECRET=throwaway ... run build` green. Clear a stale `apps/admin/.next` before `tsc`/build.
- **GIT:** `git branch --show-current` guard (`[ "$B" != master ]`) before EVERY commit. Never commit to master. Per-task commits are pre-approved ON the feature branch; never push/merge (the user merges). Commit trailers: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>` + `Claude-Session: https://claude.ai/code/session_015EtzpoR6aBNAHKLcPhAAEP`.
- Feature branch: `figma-sync-reconcile-changedetect` off master.
- Never auto-delete committed code — only seed-only orphans. Change-detection is components-only (icons self-heal).
- No false positives: a contract with no stamped `figmaUpdatedAt` (legacy) is NEVER stale.

---

## File structure

**Codegen (`packages/codegen/src`)**
- `delete.ts` — extract `removeComponentFiles(slug, isIcon, root)` (dir + barrel, no manifest); `deleteComponent` reuses it.
- `sync-reconcile.ts` — **NEW** pure `findOrphans(...)` + `hasGeneratedCode(...)` fs helper + `isFigmaStale(current?, generatedFrom?)` predicate.
- `sync.ts` — `writeSync` returns `{ written, removed, orphanedCommitted }`, runs reconcile; `toManifestEntry` sets `figmaUpdatedAt`; `toSeedContract` leaves it unset.
- `figma.ts` — `FigmaLibComponent.updated_at?: string`.
- `sync-curate.ts` — `ResolvedComponentGroup.figmaUpdatedAt?`; `mergeIn`/`buildComponentGroups` thread the latest `updated_at`.
- `loaders.ts` — `ManifestEntry.figmaUpdatedAt?`, `ComponentContractFile.figmaUpdatedAt?`; `writeSeedContract` preserves an existing contract's `figmaUpdatedAt` on merge.
- `cli.ts` — `sync()` prints removed/orphaned; generate path stamps `contractFile.figmaUpdatedAt = entry?.figmaUpdatedAt`.

**Admin (`apps/admin`)**
- `lib/design-state.ts` — `ManifestEntry.figmaUpdatedAt?`, `ComponentState.stale?`; `deriveComponentState` takes a `contractVersions` map; `loadComponentState` batch-reads committed component contracts.
- `app/components/StaleBadge.tsx` — **NEW** badge.
- `app/components/dashboard.module.css` — `--status-stale*` vars + `.statusStale`.
- `app/components/SelectableComponents.tsx` — render `<StaleBadge/>` next to `<StatusBadge/>`.
- `app/review/[slug]/page.tsx` — read contract, render a stale banner.

**Tests**
- `packages/codegen/test/`: `delete.test.ts` (+removeComponentFiles), `sync-reconcile.test.ts` (NEW), `sync-write.test.ts` (+reconcile, +figmaUpdatedAt round-trip), `sync-curate.test.ts` (+updated_at), `loaders.test.ts` (+contract preserve).
- `apps/admin/test/`: `stale.test.ts` (NEW — `deriveComponentState` staleness).

---

## Task 1: Extract `removeComponentFiles` from `deleteComponent`

**Files:**
- Modify: `packages/codegen/src/delete.ts`
- Test: `packages/codegen/test/delete.test.ts`

**Interfaces:**
- Produces: `removeComponentFiles(slug: string, isIcon: boolean, root: string): string[]` — removes the component dir + its barrel export lines (NO manifest edit); returns changed absolute paths. `deleteComponent(slug, root)` unchanged externally.

- [ ] **Step 1: Write the failing test**

Add to `packages/codegen/test/delete.test.ts` (adapt the temp-root helper already used there — mkdtemp a root, seed a barrel + a component dir):

```ts
import { removeComponentFiles } from "../src/delete";
// ... inside the existing suite, using the same tmp-root setup pattern:

test("removeComponentFiles removes the dir + barrel lines, leaves siblings", () => {
  const root = makeTmpRoot(); // existing helper in this file
  const compDir = join(root, "packages/components/src/components/button");
  mkdirSync(compDir, { recursive: true });
  writeFileSync(join(compDir, "Button.tsx"), "export const Button = () => null;");
  const barrel = join(root, "packages/components/src/index.ts");
  mkdirSync(dirname(barrel), { recursive: true });
  writeFileSync(
    barrel,
    'export { Button } from "./components/button";\n' +
      'export type { ButtonProps } from "./components/button";\n' +
      'export { Chip } from "./components/chip";\n',
  );

  const changed = removeComponentFiles("button", false, root);

  assert.ok(!existsSync(compDir), "component dir removed");
  const kept = readFileSync(barrel, "utf8");
  assert.ok(!kept.includes("./components/button"), "button barrel lines gone");
  assert.ok(kept.includes("./components/chip"), "sibling barrel line kept");
  assert.ok(changed.some((p) => p.includes("button")));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/delete.test.ts`
Expected: FAIL — `removeComponentFiles` is not exported.

- [ ] **Step 3: Implement — extract the helper, keep `deleteComponent` behavior identical**

Replace `packages/codegen/src/delete.ts` body so the dir+barrel removal lives in `removeComponentFiles` and `deleteComponent` calls it:

```ts
import { rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { findRepoRoot, loadManifest, writeManifest, MANIFEST_FILE } from "./loaders";
import { componentSourcePaths } from "./paths";

/** Remove a component's on-disk footprint: its source dir and any root-barrel
 *  export line referencing it (NOT its manifest entry). Returns changed paths.
 *  Shared by `deleteComponent` (manual delete) and sync's orphan reconcile. */
export function removeComponentFiles(slug: string, isIcon: boolean, root: string = findRepoRoot()): string[] {
  const changed: string[] = [];

  const relDir = componentSourcePaths(slug, isIcon).dir; // "src/components/<slug>"
  const absDir = join(root, "packages", "components", relDir);
  if (existsSync(absDir)) {
    rmSync(absDir, { recursive: true, force: true });
    changed.push(absDir);
  }

  const barrelPath = join(root, "packages", "components", "src", "index.ts");
  if (existsSync(barrelPath)) {
    const marker = `./${isIcon ? "icons" : "components"}/${slug}"`;
    const lines = readFileSync(barrelPath, "utf8").split("\n");
    const kept = lines.filter((line) => !line.includes(marker));
    if (kept.length !== lines.length) {
      writeFileSync(barrelPath, kept.join("\n"));
      changed.push(barrelPath);
    }
  }
  return changed;
}

/**
 * Fully remove a component from the repo: its manifest entry, its source dir,
 * and any root-barrel export line. Returns the changed paths. Throws if the slug
 * is not in the manifest.
 */
export function deleteComponent(slug: string, root: string = findRepoRoot()): string[] {
  const manifest = loadManifest(root);
  const entry =
    manifest.components.find((e) => e.slug === slug) ?? manifest.icons.find((e) => e.slug === slug);
  if (!entry) throw new Error(`delete: "${slug}" is not in ${MANIFEST_FILE}`);

  const changed: string[] = [];
  manifest.components = manifest.components.filter((e) => e.slug !== slug);
  manifest.icons = manifest.icons.filter((e) => e.slug !== slug);
  writeManifest(manifest, root);
  changed.push(join(root, MANIFEST_FILE));

  changed.push(...removeComponentFiles(slug, entry.isIcon, root));
  return changed;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/delete.test.ts`
Expected: PASS (new test + the existing `deleteComponent` tests still green).

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
B=$(git branch --show-current); [ "$B" != master ] && \
git add packages/codegen/src/delete.ts packages/codegen/test/delete.test.ts && \
git commit -m "refactor(codegen): extract removeComponentFiles from deleteComponent

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015EtzpoR6aBNAHKLcPhAAEP"
```

---

## Task 2: `findOrphans` + `hasGeneratedCode` (pure/injectable) in `sync-reconcile.ts`

**Files:**
- Create: `packages/codegen/src/sync-reconcile.ts`
- Test: `packages/codegen/test/sync-reconcile.test.ts`

**Interfaces:**
- Consumes: `Manifest`, `ManifestEntry` (`./loaders`); `SyncResult` (`./sync`) — but to avoid a circular import, `findOrphans` takes the minimal shape below, not `SyncResult`.
- Produces:
  - `type OrphanRef = { slug: string; isIcon: boolean }`
  - `findOrphans(oldManifest: { components: ManifestEntry[]; icons: ManifestEntry[] }, next: { components: { slug: string }[]; icons: { slug: string }[] }, hasGeneratedCode: (slug: string, isIcon: boolean) => boolean): { removable: OrphanRef[]; committed: string[] }`
  - `hasGeneratedCode(slug: string, isIcon: boolean, root: string): boolean` — true if the component's generated `.tsx` exists on disk.
  - `isFigmaStale(current: string | undefined, generatedFrom: string | undefined): boolean` — true iff both are set and differ.

- [ ] **Step 1: Write the failing test**

Create `packages/codegen/test/sync-reconcile.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { findOrphans, isFigmaStale } from "../src/sync-reconcile";

const entry = (slug: string, isIcon = false) => ({ name: slug, slug, isIcon, figmaNodeIds: [] });

test("findOrphans: a seed-only vanished component is removable", () => {
  const old = { components: [entry("button"), entry("chip")], icons: [] };
  const next = { components: [{ slug: "button" }], icons: [] };
  const { removable, committed } = findOrphans(old, next, () => false); // nothing generated
  assert.deepEqual(removable, [{ slug: "chip", isIcon: false }]);
  assert.deepEqual(committed, []);
});

test("findOrphans: a vanished component WITH generated code is reported, not removed", () => {
  const old = { components: [entry("button"), entry("chip")], icons: [] };
  const next = { components: [{ slug: "button" }], icons: [] };
  const { removable, committed } = findOrphans(old, next, (slug) => slug === "chip");
  assert.deepEqual(removable, []);
  assert.deepEqual(committed, ["chip"]);
});

test("findOrphans: icons are classified too", () => {
  const old = { components: [], icons: [entry("plus", true), entry("minus", true)] };
  const next = { components: [], icons: [{ slug: "plus" }] };
  const { removable, committed } = findOrphans(old, next, () => false);
  assert.deepEqual(removable, [{ slug: "minus", isIcon: true }]);
  assert.deepEqual(committed, []);
});

test("findOrphans: no orphans -> empty", () => {
  const old = { components: [entry("button")], icons: [] };
  const next = { components: [{ slug: "button" }], icons: [] };
  const { removable, committed } = findOrphans(old, next, () => true);
  assert.deepEqual(removable, []);
  assert.deepEqual(committed, []);
});

test("isFigmaStale: only when both set and differ", () => {
  assert.equal(isFigmaStale("2026-07-24T00:00:00Z", "2026-07-01T00:00:00Z"), true);
  assert.equal(isFigmaStale("2026-07-24T00:00:00Z", "2026-07-24T00:00:00Z"), false);
  assert.equal(isFigmaStale("2026-07-24T00:00:00Z", undefined), false); // legacy: never stale
  assert.equal(isFigmaStale(undefined, "2026-07-01T00:00:00Z"), false);
  assert.equal(isFigmaStale(undefined, undefined), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/sync-reconcile.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `sync-reconcile.ts`**

```ts
/**
 * Orphan reconcile for sync + the change-detection staleness predicate.
 *
 * An orphan = a slug present in the OLD manifest but absent from the freshly
 * curated result. Sync auto-removes only SEED-ONLY orphans (never generated);
 * an orphan WITH committed code is reported for a deliberate `codegen delete`,
 * never silently destroyed. Pure `findOrphans` (fs check injected) so it's
 * unit-testable without disk.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { findRepoRoot, type ManifestEntry } from "./loaders";
import { componentSourcePaths } from "./paths";

export type OrphanRef = { slug: string; isIcon: boolean };

/** True if the component's generated .tsx exists on disk (i.e. real code, not a
 *  never-generated seed). A seed on disk is only `<slug>.contract.json`. */
export function hasGeneratedCode(slug: string, isIcon: boolean, root: string = findRepoRoot()): boolean {
  const { tsxPath } = componentSourcePaths(slug, isIcon);
  return existsSync(join(root, "packages", "components", tsxPath));
}

/** Classify vanished components. `removable` = seed-only orphans (safe to
 *  delete). `committed` = orphans with generated code (report, don't delete). */
export function findOrphans(
  oldManifest: { components: ManifestEntry[]; icons: ManifestEntry[] },
  next: { components: { slug: string }[]; icons: { slug: string }[] },
  hasCode: (slug: string, isIcon: boolean) => boolean,
): { removable: OrphanRef[]; committed: string[] } {
  const nextSlugs = new Set([...next.components, ...next.icons].map((e) => e.slug));
  const removable: OrphanRef[] = [];
  const committed: string[] = [];
  for (const e of [...oldManifest.components, ...oldManifest.icons]) {
    if (nextSlugs.has(e.slug)) continue;
    if (hasCode(e.slug, e.isIcon)) committed.push(e.slug);
    else removable.push({ slug: e.slug, isIcon: e.isIcon });
  }
  return { removable, committed };
}

/** A component is stale iff the manifest's current Figma updated_at and the
 *  contract's generated-from updated_at are BOTH set and differ. Undefined on
 *  either side (legacy/unstamped) => not stale (no false positives). */
export function isFigmaStale(current: string | undefined, generatedFrom: string | undefined): boolean {
  return !!current && !!generatedFrom && current !== generatedFrom;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/sync-reconcile.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
B=$(git branch --show-current); [ "$B" != master ] && \
git add packages/codegen/src/sync-reconcile.ts packages/codegen/test/sync-reconcile.test.ts && \
git commit -m "feat(codegen): findOrphans + isFigmaStale in sync-reconcile

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015EtzpoR6aBNAHKLcPhAAEP"
```

---

## Task 3: Wire orphan reconcile into `writeSync` + CLI summary

**Files:**
- Modify: `packages/codegen/src/sync.ts` (`writeSync` return type + reconcile step)
- Modify: `packages/codegen/src/cli.ts` (`sync()` summary)
- Test: `packages/codegen/test/sync-write.test.ts`

**Interfaces:**
- Consumes: `findOrphans`, `hasGeneratedCode`, `removeComponentFiles`.
- Produces: `writeSync(result, root): { written: string[]; removed: string[]; orphanedCommitted: string[] }` (was `string[]`).

- [ ] **Step 1: Write the failing test**

Add to `packages/codegen/test/sync-write.test.ts` (uses a tmp root with a seeded manifest — follow the file's existing setup). Key: seed an OLD manifest containing `chip` (seed-only) and `avatar` (with a `.tsx`), then `writeSync` a result WITHOUT them:

```ts
import { removeComponentFiles } from "../src/delete"; // for setup sanity if needed

test("writeSync removes a seed-only orphan and reports a committed orphan", () => {
  const root = makeTmpSyncRoot(); // existing helper: writes manifest.json + tokens dir
  // seed OLD manifest: button (kept), chip (seed-only orphan), avatar (committed orphan)
  writeManifest(
    { components: [m("button"), m("chip"), m("avatar")], icons: [] },
    root,
  );
  // avatar has generated code; chip is seed-only
  const avatarDir = join(root, "packages/components/src/components/avatar");
  mkdirSync(avatarDir, { recursive: true });
  writeFileSync(join(avatarDir, "Avatar.tsx"), "export const Avatar = () => null;");
  const chipDir = join(root, "packages/components/src/components/chip");
  mkdirSync(chipDir, { recursive: true });
  writeFileSync(join(chipDir, "chip.contract.json"), "{}");

  const result = {
    components: [m("button")], icons: [], contracts: [], tokens: [], tokensSkipped: 0,
  };
  const out = writeSync(result as any, root);

  assert.ok(!existsSync(chipDir), "seed-only orphan dir removed");
  assert.ok(existsSync(avatarDir), "committed orphan dir preserved");
  assert.deepEqual(out.orphanedCommitted, ["avatar"]);
  assert.ok(out.removed.some((p) => p.includes("chip")));
});
```

(`m(slug)` = `{ name: slug, slug, isIcon: false, figmaNodeIds: [] }` — add a small helper if the file lacks one.)

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/sync-write.test.ts`
Expected: FAIL — `out` is a `string[]`, has no `.orphanedCommitted`.

- [ ] **Step 3: Implement — reconcile in `writeSync`**

In `packages/codegen/src/sync.ts`, add imports:

```ts
import { findOrphans, hasGeneratedCode } from "./sync-reconcile";
import { removeComponentFiles } from "./delete";
```

Replace `writeSync` (currently returns `string[]`):

```ts
export interface WriteSyncResult {
  written: string[];
  removed: string[];
  orphanedCommitted: string[];
}

/** Persists a runSync result: manifest (preserving figmaFileKey), tokens, and
 *  each seed contract. Then reconciles orphans: components in the OLD manifest
 *  but not in this result get their seed-only files removed; committed orphans
 *  are reported (never auto-deleted). Returns written/removed paths + the
 *  committed-orphan slugs. */
export function writeSync(result: SyncResult, root: string = findRepoRoot()): WriteSyncResult {
  const written: string[] = [];

  const existing = loadManifest(root); // OLD manifest -- read BEFORE overwriting
  writeManifest({ figmaFileKey: existing.figmaFileKey, components: result.components, icons: result.icons }, root);
  written.push(join(root, MANIFEST_FILE));

  writeTokensJson(result.tokens, root);
  written.push(join(root, TOKENS_FILE), join(root, TOKENS_CSS_REL));

  for (const contract of result.contracts) written.push(writeSeedContract(contract, root));

  // Reconcile orphans (seed-only removed; committed reported).
  const { removable, committed } = findOrphans(
    existing,
    { components: result.components, icons: result.icons },
    (slug, isIcon) => hasGeneratedCode(slug, isIcon, root),
  );
  const removed: string[] = [];
  for (const { slug, isIcon } of removable) removed.push(...removeComponentFiles(slug, isIcon, root));

  return { written, removed, orphanedCommitted: committed };
}
```

- [ ] **Step 4: Update the CLI summary in `cli.ts` `sync()`**

Replace the summary block (currently `const written = writeSync(...)` + one `console.log`) with:

```ts
  const { written, removed, orphanedCommitted } = writeSync(result, root);
  console.log(
    `sync: ${result.components.length} components, ${result.icons.length} icons, ${result.tokens.length} tokens (${result.tokensSkipped} skipped)\n${written.length} files written, ${removed.length} orphan paths removed`,
  );
  if (orphanedCommitted.length > 0) {
    console.warn(
      `⚠ gone from Figma but has committed code (left intact): ${orphanedCommitted.join(", ")}\n` +
        `  run \`codegen delete <slug>\` for any you intend to remove.`,
    );
  }
```

- [ ] **Step 5: Run tests + typecheck**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && \
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/sync-write.test.ts && \
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
```
Expected: PASS + no type errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
B=$(git branch --show-current); [ "$B" != master ] && \
git add packages/codegen/src/sync.ts packages/codegen/src/cli.ts packages/codegen/test/sync-write.test.ts && \
git commit -m "feat(codegen): reconcile orphans on sync (remove seeds, report committed)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015EtzpoR6aBNAHKLcPhAAEP"
```

---

## Task 4: Capture Figma `updated_at` through curation

**Files:**
- Modify: `packages/codegen/src/figma.ts` (`FigmaLibComponent`)
- Modify: `packages/codegen/src/sync-curate.ts` (`ResolvedComponentGroup`, `mergeIn`, `buildComponentGroups`)
- Test: `packages/codegen/test/sync-curate.test.ts`

**Interfaces:**
- Produces: `ResolvedComponentGroup.figmaUpdatedAt?: string` — the latest `updated_at` among the entries merged into the group.

- [ ] **Step 1: Write the failing test**

Add to `packages/codegen/test/sync-curate.test.ts` (follow its existing `buildComponentGroups` call pattern):

```ts
test("buildComponentGroups keeps the latest updated_at across merged entries", () => {
  const comps = [
    { node_id: "1:1", name: "🟢 Button", updated_at: "2026-07-01T00:00:00Z" },
    { node_id: "1:2", name: "🟢 Button", updated_at: "2026-07-20T00:00:00Z" }, // same literal name -> merged
  ] as any;
  const groups = buildComponentGroups([], comps);
  const button = groups.find((g) => g.slug === "button");
  assert.ok(button);
  assert.equal(button!.figmaUpdatedAt, "2026-07-20T00:00:00Z");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/sync-curate.test.ts`
Expected: FAIL — `figmaUpdatedAt` is undefined.

- [ ] **Step 3a: Add the wire field in `figma.ts`**

In `FigmaLibComponent` (currently `node_id/name/description?/containing_frame?`), add:

```ts
export interface FigmaLibComponent {
  node_id: string;
  name: string;
  description?: string;
  containing_frame?: { pageName?: string };
  updated_at?: string; // ISO; Figma /components + /component_sets return it per node
}
```

- [ ] **Step 3b: Thread it in `sync-curate.ts`**

Add to `ResolvedComponentGroup`:

```ts
export interface ResolvedComponentGroup {
  slug: string;
  name: string;
  description?: string;
  figmaNodeIds: string[];
  variants: DesignComponentVariant[];
  states: DesignComponentState[];
  isIcon: boolean;
  figmaUpdatedAt?: string;
}
```

Give `mergeIn` an `updatedAt` param and keep the max (lexicographic max works for ISO-8601 UTC strings). Change its signature + both call sites:

```ts
  const mergeIn = (
    name: string,
    description: string | undefined,
    figmaNodeIds: string[],
    variants: DesignComponentVariant[],
    states: DesignComponentState[],
    isIcon: boolean,
    updatedAt: string | undefined,
  ) => {
    const key = slugKeyFor(name);
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, {
        slug: "", name: key, description, figmaNodeIds: [...figmaNodeIds],
        variants, states, isIcon, figmaUpdatedAt: updatedAt,
      });
      order.push(key);
      return;
    }
    // ... existing variant/state/nodeId/description/isIcon merges unchanged ...
    existing.figmaUpdatedAt = maxIso(existing.figmaUpdatedAt, updatedAt);
  };
```

Add a tiny helper near the top of the module:

```ts
/** Later ISO-8601 UTC timestamp of two maybe-undefined values (string compare
 *  is correct for same-offset ISO strings). */
function maxIso(a: string | undefined, b: string | undefined): string | undefined {
  if (!a) return b;
  if (!b) return a;
  return a >= b ? a : b;
}
```

Pass `updated_at` at both `mergeIn` call sites:

```ts
  for (const set of sets) {
    const children = variantsBySetId?.get(set.node_id) ?? [];
    const { variants, states } = parseVariantChildren(children);
    mergeIn(set.name, set.description, [set.node_id, ...children.map((c) => c.id)], variants, states,
      isLikelyIconName(set.name, set.containing_frame?.pageName), set.updated_at);
  }
  for (const component of comps) {
    mergeIn(component.name, component.description, [component.node_id], [], [],
      isLikelyIconName(component.name, component.containing_frame?.pageName), component.updated_at);
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/sync-curate.test.ts`
Expected: PASS (new test + existing curation tests green).

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
B=$(git branch --show-current); [ "$B" != master ] && \
git add packages/codegen/src/figma.ts packages/codegen/src/sync-curate.ts packages/codegen/test/sync-curate.test.ts && \
git commit -m "feat(codegen): capture Figma updated_at through curation

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015EtzpoR6aBNAHKLcPhAAEP"
```

---

## Task 5: Persist `figmaUpdatedAt` (manifest current + contract generated-from)

**Files:**
- Modify: `packages/codegen/src/loaders.ts` (`ManifestEntry`, `ComponentContractFile`, `writeSeedContract`)
- Modify: `packages/codegen/src/sync.ts` (`toManifestEntry`)
- Test: `packages/codegen/test/loaders.test.ts`

**Interfaces:**
- Produces: `ManifestEntry.figmaUpdatedAt?: string` (current Figma time, written every sync); `ComponentContractFile.figmaUpdatedAt?: string` (generated-from, PRESERVED across syncs). `toManifestEntry` sets the manifest field from `group.figmaUpdatedAt`; `toSeedContract` leaves the contract field unset (a never-generated seed has no generated-from).

- [ ] **Step 1: Write the failing test**

Add to `packages/codegen/test/loaders.test.ts`:

```ts
test("writeSeedContract preserves an existing contract's figmaUpdatedAt across re-sync", () => {
  const root = makeTmpRoot(); // existing helper; has a manifest so componentSourcePaths dir resolves
  // First: a generated contract stamped with a generated-from time.
  writeSeedContract(
    { name: "Button", slug: "button", isIcon: false, figmaNodeIds: ["1:1"], variants: [], states: [],
      contract: { props: [{ name: "x" } as any], cssVariables: [], classNames: [] },
      figmaUpdatedAt: "2026-07-01T00:00:00Z" },
    root,
  );
  // Re-sync writes a fresh seed WITHOUT figmaUpdatedAt (seed = no generated-from).
  writeSeedContract(
    { name: "Button", slug: "button", isIcon: false, figmaNodeIds: ["1:1"], variants: [], states: [],
      contract: { props: [], cssVariables: [], classNames: [] } },
    root,
  );
  const loaded = loadComponentContract("button", root);
  assert.equal(loaded?.figmaUpdatedAt, "2026-07-01T00:00:00Z", "generated-from stamp survives re-sync");
  assert.equal(loaded?.contract.props.length, 1, "generated contract block also preserved");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/loaders.test.ts`
Expected: FAIL — `figmaUpdatedAt` not preserved (currently `undefined` after re-sync) and/or a type error on the field.

- [ ] **Step 3a: Add the fields in `loaders.ts`**

```ts
export interface ManifestEntry {
  name: string;
  slug: string;
  isIcon: boolean;
  figmaNodeIds: string[];
  figmaUpdatedAt?: string; // current Figma updated_at (sync writes it every run)
}

export interface ComponentContractFile {
  name: string;
  slug: string;
  isIcon: boolean;
  figmaNodeIds: string[];
  variants: DesignComponentVariant[];
  states: DesignComponentState[];
  contract: StoredComponentContract;
  figmaUpdatedAt?: string; // the Figma updated_at this code was GENERATED FROM
}
```

- [ ] **Step 3b: Preserve it in `writeSeedContract`**

Change the merge so BOTH `contract` and `figmaUpdatedAt` survive (an existing generated-from wins; a fresh seed never clobbers it):

```ts
export function writeSeedContract(entry: ComponentContractFile, root: string = findRepoRoot()): string {
  const existing = loadComponentContract(entry.slug, root);
  const merged: ComponentContractFile = {
    ...entry,
    contract: existing?.contract ?? entry.contract,
    figmaUpdatedAt: existing?.figmaUpdatedAt ?? entry.figmaUpdatedAt,
  };
  const dir = join(root, "packages", "components", componentSourcePaths(entry.slug, entry.isIcon).dir);
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `${entry.slug}.contract.json`);
  writeFileSync(path, JSON.stringify(merged, null, 2) + "\n");
  return path;
}
```

- [ ] **Step 3c: Set the manifest field in `sync.ts` `toManifestEntry`**

```ts
function toManifestEntry(group: ResolvedComponentGroup): ManifestEntry {
  return {
    name: group.name, slug: group.slug, isIcon: group.isIcon,
    figmaNodeIds: group.figmaNodeIds, figmaUpdatedAt: group.figmaUpdatedAt,
  };
}
```

(`toSeedContract` stays as-is — it does NOT set `figmaUpdatedAt`, so a seed carries none; generation stamps it in Task 6.)

- [ ] **Step 4: Run tests + typecheck**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && \
corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/loaders.test.ts && \
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
```
Expected: PASS + no type errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
B=$(git branch --show-current); [ "$B" != master ] && \
git add packages/codegen/src/loaders.ts packages/codegen/src/sync.ts packages/codegen/test/loaders.test.ts && \
git commit -m "feat(codegen): persist figmaUpdatedAt (manifest current + contract generated-from)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015EtzpoR6aBNAHKLcPhAAEP"
```

---

## Task 6: Stamp `figmaUpdatedAt` at generation

**Files:**
- Modify: `packages/codegen/src/cli.ts` (regular-component generate path, ~line 221)
- Test: `packages/codegen/test/loaders.test.ts` (writeComponent round-trip)

**Interfaces:**
- Consumes: `ManifestEntry.figmaUpdatedAt` (the manifest entry loaded at cli.ts:143 as `entry`).
- Produces: a generated component's `<slug>.contract.json` carries `figmaUpdatedAt` = the manifest entry's current value at generation time. Icons are NOT stamped (components-only).

- [ ] **Step 1: Write the failing test**

Add to `packages/codegen/test/loaders.test.ts` — prove `writeComponent` persists the field (the cli just sets it on `contractFile`, which `writeComponent` serializes):

```ts
test("writeComponent persists a contract's figmaUpdatedAt", () => {
  const root = makeTmpRoot();
  const files = {
    componentName: "Button",
    tsxPath: "src/components/button/Button.tsx", tsxContent: "x",
    cssPath: "src/components/button/Button.module.scss", cssContent: "x",
    storiesPath: "src/components/button/Button.stories.tsx", storiesContent: "x",
    indexPath: "src/components/button/index.ts", indexContent: "x",
    deletePaths: [], inputTokens: 0, outputTokens: 0, costUsd: 0,
  };
  writeComponent(
    { name: "Button", slug: "button", isIcon: false, figmaNodeIds: ["1:1"], variants: [], states: [],
      contract: { props: [], cssVariables: [], classNames: [] }, figmaUpdatedAt: "2026-07-24T00:00:00Z" },
    files as any, root,
  );
  const loaded = loadComponentContract("button", root);
  assert.equal(loaded?.figmaUpdatedAt, "2026-07-24T00:00:00Z");
});
```

- [ ] **Step 2: Run test to verify it fails or passes**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && corepack pnpm --filter @d-2-g-8/codegen exec tsx --test test/loaders.test.ts`
Expected: PASS already (writeComponent serializes the whole `contractFile` via `JSON.stringify`). This test LOCKS that behavior so the cli stamp survives — keep it.

- [ ] **Step 3: Implement the cli stamp**

In `packages/codegen/src/cli.ts`, the regular-component `contractFile` (currently at ~line 221) gains `figmaUpdatedAt`:

```ts
  const contractFile: ComponentContractFile = {
    name, slug, isIcon: false, figmaNodeIds,
    variants: component.variants, states: component.states,
    contract: reviewed.contract,
    figmaUpdatedAt: entry?.figmaUpdatedAt, // stamp the Figma version we generated from
  };
```

(Do NOT touch the icon `contractFile` at ~line 173 — icons are excluded from staleness.)

- [ ] **Step 4: Typecheck + full codegen suite**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && \
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit && \
corepack pnpm --filter @d-2-g-8/codegen test
```
Expected: no type errors; all 62+ tests pass.

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
B=$(git branch --show-current); [ "$B" != master ] && \
git add packages/codegen/src/cli.ts packages/codegen/test/loaders.test.ts && \
git commit -m "feat(codegen): stamp figmaUpdatedAt into the contract at generation

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015EtzpoR6aBNAHKLcPhAAEP"
```

---

## Task 7: Admin — derive staleness in `design-state.ts`

**Files:**
- Modify: `apps/admin/lib/design-state.ts`
- Test: `apps/admin/test/stale.test.ts` (Create)

**Interfaces:**
- Produces:
  - `ComponentState.stale?: boolean`
  - admin `ManifestEntry.figmaUpdatedAt?: string`
  - `deriveComponentState(manifest, committedComponents, committedIcons, prsByBranch, deletePrs, contractVersions)` — new final param `contractVersions: Map<string, string | undefined>` (committed component slug → its contract's generated-from `figmaUpdatedAt`). A component is `stale` iff committed AND both its manifest `figmaUpdatedAt` and `contractVersions.get(slug)` are set and differ.
- Consumes (I/O in `loadComponentState`): `getFileContent("packages/components/src/components/<slug>/<slug>.contract.json")`.

- [ ] **Step 1: Write the failing test**

Create `apps/admin/test/stale.test.ts` (mirror an existing admin test's imports/runner):

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveComponentState } from "../lib/design-state";

const M = (slug: string, figmaUpdatedAt?: string) => ({ slug, name: slug, isIcon: false, figmaUpdatedAt });

test("stale when committed and Figma updated_at differs from contract", () => {
  const manifest = { components: [M("button", "2026-07-24T00:00:00Z")], icons: [] };
  const versions = new Map([["button", "2026-07-01T00:00:00Z"]]); // generated from older
  const [row] = deriveComponentState(manifest, ["button"], [], new Map(), new Map(), versions);
  assert.equal(row.status, "committed");
  assert.equal(row.stale, true);
});

test("not stale when versions match", () => {
  const manifest = { components: [M("button", "2026-07-24T00:00:00Z")], icons: [] };
  const versions = new Map([["button", "2026-07-24T00:00:00Z"]]);
  const [row] = deriveComponentState(manifest, ["button"], [], new Map(), new Map(), versions);
  assert.equal(row.stale, false);
});

test("not stale when contract has no stamp (legacy)", () => {
  const manifest = { components: [M("button", "2026-07-24T00:00:00Z")], icons: [] };
  const versions = new Map<string, string | undefined>([["button", undefined]]);
  const [row] = deriveComponentState(manifest, ["button"], [], new Map(), new Map(), versions);
  assert.equal(row.stale, false);
});

test("not stale when not committed", () => {
  const manifest = { components: [M("button", "2026-07-24T00:00:00Z")], icons: [] };
  const [row] = deriveComponentState(manifest, [], [], new Map(), new Map(), new Map());
  assert.equal(row.status, "never");
  assert.equal(row.stale, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && corepack pnpm --filter @d-2-g-8/design-system-admin exec tsx --test test/stale.test.ts`
Expected: FAIL — `deriveComponentState` has 5 params / no `stale`.

- [ ] **Step 3: Implement in `design-state.ts`**

Extend the interface + types and add the derivation. `isFigmaStale` is a local 1-liner (mirrors codegen's — admin can't import the fs-bound package):

```ts
export interface ComponentState {
  slug: string;
  name: string;
  isIcon: boolean;
  status: "committed" | "pending" | "never";
  prUrl?: string;
  deletePrUrl?: string;
  stale?: boolean;
}

interface ManifestEntry { slug: string; name: string; isIcon: boolean; figmaUpdatedAt?: string }
interface Manifest { components: ManifestEntry[]; icons: ManifestEntry[] }

/** Mirrors codegen's isFigmaStale: stale iff both set and differ. */
function isFigmaStale(current?: string, generatedFrom?: string): boolean {
  return !!current && !!generatedFrom && current !== generatedFrom;
}

export function deriveComponentState(
  manifest: Manifest,
  committedComponents: string[],
  committedIcons: string[],
  prsByBranch: Map<string, string>,
  deletePrs: Map<string, string> = new Map(),
  contractVersions: Map<string, string | undefined> = new Map(),
): ComponentState[] {
  const all = [...(manifest.components ?? []), ...(manifest.icons ?? [])];
  return all.map((e) => {
    const deletePrUrl = deletePrs.get(e.slug);
    const committed = (e.isIcon ? committedIcons : committedComponents).includes(e.slug);
    if (committed) {
      const stale = !e.isIcon && isFigmaStale(e.figmaUpdatedAt, contractVersions.get(e.slug));
      return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "committed", deletePrUrl, stale };
    }
    const prUrl = prsByBranch.get(`codegen/${e.slug}`);
    if (prUrl) return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "pending", prUrl, deletePrUrl };
    return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "never", deletePrUrl };
  });
}
```

- [ ] **Step 4: Wire the I/O in `loadComponentState`**

Batch-read the committed **component** contracts (icons excluded) and build the versions map:

```ts
export async function loadComponentState(): Promise<ComponentState[]> {
  const raw = await getFileContent("design-system.manifest.json");
  if (!raw) throw new Error("design-system.manifest.json not found on master");
  const manifest = JSON.parse(raw) as Manifest;
  const [tree, prs, deletePrs] = await Promise.all([listTree("master"), listOpenCodegenPRs(), listOpenDeletePRs()]);
  if (tree.truncated) throw new Error("git tree truncated -- cannot reliably derive committed state");
  const components = committedSlugsFromTree(tree.paths, "packages/components/src/components");
  const icons = committedSlugsFromTree(tree.paths, "packages/components/src/icons");

  // Change-detection: read each committed COMPONENT's contract for its
  // generated-from figmaUpdatedAt (icons excluded -- they self-heal on sync).
  const versionPairs = await Promise.all(
    components.map(async (slug): Promise<[string, string | undefined]> => {
      const c = await getFileContent(`packages/components/src/components/${slug}/${slug}.contract.json`).catch(() => null);
      if (!c) return [slug, undefined];
      try { return [slug, (JSON.parse(c) as { figmaUpdatedAt?: string }).figmaUpdatedAt]; }
      catch { return [slug, undefined]; }
    }),
  );
  const contractVersions = new Map(versionPairs);

  return deriveComponentState(manifest, components, icons, prs, deletePrs, contractVersions);
}
```

- [ ] **Step 5: Run test + typecheck**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && \
corepack pnpm --filter @d-2-g-8/design-system-admin exec tsx --test test/stale.test.ts && \
corepack pnpm --filter @d-2-g-8/design-system-admin run typecheck
```
Expected: PASS (4 tests) + no type errors.

- [ ] **Step 6: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
B=$(git branch --show-current); [ "$B" != master ] && \
git add apps/admin/lib/design-state.ts apps/admin/test/stale.test.ts && \
git commit -m "feat(admin): derive Figma-changed staleness for committed components

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015EtzpoR6aBNAHKLcPhAAEP"
```

---

## Task 8: Admin — stale badge on dashboard rows

**Files:**
- Create: `apps/admin/app/components/StaleBadge.tsx`
- Modify: `apps/admin/app/components/dashboard.module.css` (`--status-stale*` + `.statusStale`)
- Modify: `apps/admin/app/components/SelectableComponents.tsx` (render next to StatusBadge)

**Interfaces:**
- Consumes: `ComponentState.stale`.
- Produces: a `<StaleBadge/>` rendered after `<StatusBadge/>` when `c.stale` is true.

- [ ] **Step 1: Add CSS vars + class**

In `apps/admin/app/components/dashboard.module.css`, near the light status vars (after `--status-never-bg: #f0eee6;`, ~line 35):

```css
  --status-stale: #7a3ea3;
  --status-stale-bg: #f2e9fa;
```

In the dark block (after `--status-never-bg: #29271e;`, ~line 80):

```css
    --status-stale: #c99ae6;
    --status-stale-bg: #2a1b33;
```

After `.statusNever` (near the other status classes, ~line 402+):

```css
.statusStale {
  background: var(--status-stale-bg);
  color: var(--status-stale);
}
.statusStale .badgeDot {
  background: var(--status-stale);
}
```

- [ ] **Step 2: Create `StaleBadge.tsx`**

```tsx
import styles from "./dashboard.module.css";

/** Overlay badge for a committed component whose Figma design changed since it
 *  was generated -- a nudge to regenerate. Renders next to StatusBadge. */
export function StaleBadge() {
  return (
    <span className={`${styles.badge} ${styles.statusStale}`} title="Figma design changed since this was generated">
      <span className={styles.badgeDot} aria-hidden="true" />
      Figma changed
    </span>
  );
}
```

- [ ] **Step 3: Render it in `SelectableComponents.tsx`**

Add the import at the top (next to the `StatusBadge` import):

```tsx
import { StaleBadge } from "./StaleBadge";
```

Change the status cell (line 88) to render both badges:

```tsx
                <td>
                  <span className={styles.badgeStack}>
                    <StatusBadge status={c.status} />
                    {c.stale && <StaleBadge />}
                  </span>
                </td>
```

Add a `.badgeStack` rule to `dashboard.module.css` (near `.badge`):

```css
.badgeStack {
  display: inline-flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: center;
}
```

- [ ] **Step 4: Typecheck + build**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && \
rm -rf apps/admin/.next && \
corepack pnpm --filter @d-2-g-8/design-system-admin run typecheck && \
AUTH_SECRET=throwaway corepack pnpm --filter @d-2-g-8/design-system-admin run build
```
Expected: typecheck clean; build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
B=$(git branch --show-current); [ "$B" != master ] && \
git add apps/admin/app/components/StaleBadge.tsx apps/admin/app/components/dashboard.module.css apps/admin/app/components/SelectableComponents.tsx && \
git commit -m "feat(admin): 'Figma changed' stale badge on dashboard rows

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015EtzpoR6aBNAHKLcPhAAEP"
```

---

## Task 9: Admin — stale notice on the review page

**Files:**
- Modify: `apps/admin/app/review/[slug]/page.tsx`
- Modify: `apps/admin/app/review/review.module.css` (notice style)

**Interfaces:**
- Consumes: manifest entry's `figmaUpdatedAt` + the component's contract `figmaUpdatedAt` (both read via `getFileContent`).
- Produces: a banner above "Design vs rendered" when the component is stale.

- [ ] **Step 1: Extend the page's ManifestEntry + read the contract**

In `apps/admin/app/review/[slug]/page.tsx`, add `figmaUpdatedAt?: string` to the local `ManifestEntry` interface (lines 16-21). After the manifest/`entry` resolution (~line 79), add a stale check that reuses the same predicate rule (local 1-liner; keep it near the top of the file):

```tsx
// (top-level helper, near findManifestEntry)
function isFigmaStale(current?: string, generatedFrom?: string): boolean {
  return !!current && !!generatedFrom && current !== generatedFrom;
}
```

After `entry`/`name` are computed (~line 79-80), add:

```tsx
  // Change-detection: read the committed contract's generated-from version and
  // compare to the manifest's current one. Components only; guarded like every
  // other read on this page.
  const contractRaw =
    entry && !entry.isIcon
      ? await getFileContent(`packages/components/src/components/${slug}/${slug}.contract.json`).catch(() => null)
      : null;
  let contractFigmaUpdatedAt: string | undefined;
  if (contractRaw) {
    try { contractFigmaUpdatedAt = (JSON.parse(contractRaw) as { figmaUpdatedAt?: string }).figmaUpdatedAt; }
    catch { contractFigmaUpdatedAt = undefined; }
  }
  const figmaChanged = isFigmaStale(entry?.figmaUpdatedAt, contractFigmaUpdatedAt);
```

- [ ] **Step 2: Render the banner**

Just above the `<section aria-labelledby="compare-heading">` (~line 120), add:

```tsx
        {figmaChanged && (
          <p className={styles.staleNotice} role="status">
            ⚠ Figma design changed since this component was generated — consider regenerating.
          </p>
        )}
```

- [ ] **Step 3: Add the notice style**

In `apps/admin/app/review/review.module.css`, near `.error`:

```css
.staleNotice {
  margin: 0;
  background: var(--status-pending-bg);
  border: 1px solid var(--line);
  border-left: 3px solid var(--status-pending);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: 0.875rem;
  color: var(--ink);
}
```

- [ ] **Step 4: Typecheck + build**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && \
rm -rf apps/admin/.next && \
corepack pnpm --filter @d-2-g-8/design-system-admin run typecheck && \
AUTH_SECRET=throwaway corepack pnpm --filter @d-2-g-8/design-system-admin run build
```
Expected: typecheck clean; build succeeds.

- [ ] **Step 5: Commit**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
B=$(git branch --show-current); [ "$B" != master ] && \
git add apps/admin/app/review/[slug]/page.tsx apps/admin/app/review/review.module.css && \
git commit -m "feat(admin): 'Figma changed' notice on the review page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_015EtzpoR6aBNAHKLcPhAAEP"
```

---

## Final verification (after all tasks)

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
corepack pnpm --filter @d-2-g-8/codegen exec tsc --noEmit
corepack pnpm --filter @d-2-g-8/codegen test
rm -rf apps/admin/.next
corepack pnpm --filter @d-2-g-8/design-system-admin run typecheck
corepack pnpm --filter @d-2-g-8/design-system-admin test
AUTH_SECRET=throwaway corepack pnpm --filter @d-2-g-8/design-system-admin run build
```
All green = ready for whole-branch review, then the user merges.

## Self-review notes (traceability)
- Spec #2 (orphan reconcile) → Tasks 1-3. Seed-only auto-remove + committed-report + never-touch-code all in `findOrphans` (Task 2) and `writeSync` (Task 3).
- Spec #6 (change-detection) → Tasks 4-9. Capture (4) → persist (5) → stamp (6) → admin derive (7) → dashboard badge (8) → review notice (9).
- Self-clearing: regen re-stamps the contract (Task 6) with the manifest's current value (Task 5) → `isFigmaStale` false next read. No stored boolean.
- No false positives: `isFigmaStale` requires both sides set (Tasks 2/7/9), verified by tests.
- Icons excluded from staleness: Task 6 skips the icon path; Tasks 7/9 read only `components/` contracts; Task 7 guards `!e.isIcon`.
- Type consistency: `figmaUpdatedAt` (string, ISO) used identically across figma.ts → sync-curate.ts → loaders.ts (manifest + contract) → cli.ts → admin. `isFigmaStale(current, generatedFrom)` signature identical in codegen and admin.
```
