# Tokens View + Delete Component — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only Tokens section to the admin dashboard, and a full "delete a deployed component" flow (CLI → worker → PR → gated merge-from-admin).

**Architecture:** Tokens = a pure grouping helper + a server-component section reading `tokens/tokens.json` from master. Delete mirrors generate/sync: a `codegen delete <slug>` CLI removes the component's dir + manifest entry + barrel line; a `delete.yml` worker runs it and opens a `delete/<slug>` PR (PAT → CI); the admin dispatches it and merges it through the existing gated-merge machinery.

**Tech Stack:** Next.js 16 (App Router, server components + server actions), `packages/codegen` (Node CLI, tsup), GitHub Actions, `node:test` via `tsx`.

## Global Constraints

- Work on a feature branch off `master` (e.g. `tokens-and-delete`). **NEVER commit to master. Each commit needs the user's explicit OK** — commit steps are gated on that.
- Use `corepack pnpm` for every pnpm command. cwd resets between shells — `cd` the right dir explicitly in each bash call.
- Admin tests: from `apps/admin`, `corepack pnpm test` (`tsx --test test/*.test.ts`). Admin typecheck: `corepack pnpm exec tsc --noEmit`. Admin build: `AUTH_SECRET=throwaway-build-secret corepack pnpm build`.
- Codegen tests: from `packages/codegen`, `corepack pnpm test` (`tsx --test test/*.test.ts`). Codegen typecheck: `corepack pnpm exec tsc --noEmit`. Codegen build: `corepack pnpm build` (tsup).
- Manifest shape: `{ figmaFileKey?: string; components: ManifestEntry[]; icons: ManifestEntry[] }`, `ManifestEntry = { slug: string; name: string; isIcon: boolean; figmaNodeIds?: string[] }`.
- `tokens/tokens.json`: flat `Record<string, { category: string; value: string }>`.
- Root barrel: `packages/components/src/index.ts`, explicit lines `export { X } from "./components/<slug>";` / `export type { XProps } from "./components/<slug>";` (icons: `./icons/<slug>`). Generate does NOT add barrel lines today, so delete's barrel removal is defensive (no-op when absent).
- `componentSourcePaths(slug, isIcon).dir` is repo-relative to `packages/components` (e.g. `src/components/<slug>`). From `@d-2-g-8/codegen`'s `paths.ts`.
- `loadManifest(root)`, `writeManifest(manifest, root)`, `findRepoRoot()` are in `packages/codegen/src/loaders.ts`.
- Workflow inputs are passed via `env:` and referenced as `"$VAR"` in `run:` (never interpolated into the script) — injection-safe, matching `sync.yml`.
- Route/action code returns errors (never throws to the client → no masked production digest); UI action calls are wrapped in try/catch like `MergeButton`/`SyncActions`.

---

## Task 1: Pure token grouping helper (Tokens view)

**Files:**
- Create: `apps/admin/lib/tokens-view.ts`
- Test: `apps/admin/test/tokens-view.test.ts`

**Interfaces:**
- Produces: `TokenEntry = { category: string; value: string }`; `TokenGroup = { category: string; tokens: { name: string; value: string }[] }`; `groupTokensByCategory(tokens: Record<string, TokenEntry>): TokenGroup[]`

- [ ] **Step 1: Write the failing test**

Create `apps/admin/test/tokens-view.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupTokensByCategory } from "../lib/tokens-view";

test("groups by category, sorted by category then name", () => {
  const groups = groupTokensByCategory({
    "color-b": { category: "color", value: "#bbb" },
    "space-2": { category: "spacing", value: "8px" },
    "color-a": { category: "color", value: "#aaa" },
  });
  assert.deepEqual(groups.map((g) => g.category), ["color", "spacing"]);
  assert.deepEqual(groups[0].tokens.map((t) => t.name), ["color-a", "color-b"]);
  assert.deepEqual(groups[0].tokens[0], { name: "color-a", value: "#aaa" });
});

test("empty input yields no groups", () => {
  assert.deepEqual(groupTokensByCategory({}), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin && corepack pnpm exec tsx --test test/tokens-view.test.ts`
Expected: FAIL — cannot find module `../lib/tokens-view`.

- [ ] **Step 3: Write minimal implementation**

Create `apps/admin/lib/tokens-view.ts`:
```ts
export interface TokenEntry { category: string; value: string }
export interface TokenGroup { category: string; tokens: { name: string; value: string }[] }

/** Group a flat token map by category, categories sorted alphabetically and
 *  tokens within each category sorted by name. Pure display helper for the
 *  dashboard Tokens section. */
export function groupTokensByCategory(tokens: Record<string, TokenEntry>): TokenGroup[] {
  const byCat = new Map<string, { name: string; value: string }[]>();
  for (const [name, t] of Object.entries(tokens)) {
    const arr = byCat.get(t.category) ?? [];
    arr.push({ name, value: t.value });
    byCat.set(t.category, arr);
  }
  return [...byCat.entries()]
    .map(([category, toks]) => ({
      category,
      tokens: toks.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin && corepack pnpm exec tsx --test test/tokens-view.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit (needs user OK)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/lib/tokens-view.ts apps/admin/test/tokens-view.test.ts
git commit -m "feat(admin): pure token grouping helper for the tokens view"
```

---

## Task 2: Tokens section on the dashboard

**Files:**
- Create: `apps/admin/app/components/TokensPanel.tsx`
- Modify: `apps/admin/app/page.tsx`
- Modify: `apps/admin/app/components/dashboard.module.css`

**Interfaces:**
- Consumes: `groupTokensByCategory`, `TokenEntry` (Task 1); `getFileContent` (github.ts)

- [ ] **Step 1: Create the TokensPanel server component**

Create `apps/admin/app/components/TokensPanel.tsx`:
```tsx
import { groupTokensByCategory, type TokenEntry } from "@/lib/tokens-view";
import styles from "./dashboard.module.css";

/** Read-only dashboard section listing the design tokens (from tokens.json on
 *  master), grouped by category with a color swatch for color tokens. */
export function TokensPanel({ tokens }: { tokens: Record<string, TokenEntry> }) {
  const groups = groupTokensByCategory(tokens);
  const total = Object.keys(tokens).length;
  return (
    <section className={styles.section} aria-labelledby="tokens-heading">
      <h2 id="tokens-heading" className={styles.sectionHeading}>
        Tokens
        <span className={styles.sectionCount}>{total}</span>
      </h2>
      {total === 0 ? (
        <p className={styles.empty}>No tokens yet. Run “Sync from Figma” to import them.</p>
      ) : (
        groups.map((g) => (
          <div key={g.category} className={styles.tokenGroup}>
            <h3 className={styles.tokenCategory}>{g.category}</h3>
            <div className={styles.tokenGrid}>
              {g.tokens.map((t) => (
                <div key={t.name} className={styles.tokenItem}>
                  {g.category === "color" && (
                    <span className={styles.tokenSwatch} style={{ background: t.value }} aria-hidden="true" />
                  )}
                  <span className={styles.tokenName}>{t.name}</span>
                  <span className={styles.tokenValue}>{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
```

- [ ] **Step 2: Wire it into the dashboard**

In `apps/admin/app/page.tsx`:
- Add `TokensPanel` import: `import { TokensPanel } from "./components/TokensPanel";`
- Extend the existing `@/lib/github` import to also import `getFileContent` (it currently imports `getSyncPullRequest`). Result: `import { getSyncPullRequest, getFileContent } from "@/lib/github";`
- After `const syncPr = await getSyncPullRequest().catch(() => null);`, add:
```tsx
  const tokensRaw = await getFileContent("tokens/tokens.json").catch(() => null);
  let tokens: Record<string, { category: string; value: string }> = {};
  if (tokensRaw) {
    try { tokens = JSON.parse(tokensRaw); } catch { tokens = {}; }
  }
```
- In the success-branch JSX, immediately after `<ComponentTable ... />`, add:
```tsx
        <TokensPanel tokens={tokens} />
```

- [ ] **Step 3: Add the CSS**

Append to `apps/admin/app/components/dashboard.module.css`:
```css
.tokenGroup { margin-top: 16px; }
.tokenCategory { margin: 0 0 8px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; opacity: 0.7; }
.tokenGrid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
.tokenItem { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; background: color-mix(in srgb, var(--accent) 3%, transparent); font-size: 0.85rem; }
.tokenSwatch { width: 16px; height: 16px; border-radius: 4px; border: 1px solid color-mix(in srgb, currentColor 20%, transparent); flex: none; }
.tokenName { font-weight: 550; }
.tokenValue { margin-left: auto; opacity: 0.7; font-variant-numeric: tabular-nums; }
```

- [ ] **Step 4: Typecheck + build**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin
corepack pnpm exec tsc --noEmit && AUTH_SECRET=throwaway-build-secret corepack pnpm build
```
Expected: tsc clean; build succeeds.
Manual (user-gated, post-deploy): the dashboard shows a Tokens section with color swatches.

- [ ] **Step 5: Commit (needs user OK)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/app/components/TokensPanel.tsx apps/admin/app/page.tsx apps/admin/app/components/dashboard.module.css
git commit -m "feat(admin): tokens section on the dashboard"
```

---

## Task 3: `codegen delete <slug>` CLI command

**Files:**
- Create: `packages/codegen/src/delete.ts`
- Modify: `packages/codegen/src/cli.ts` (add the `delete` subcommand + HELP line)
- Test: `packages/codegen/test/delete.test.ts`

**Interfaces:**
- Consumes: `loadManifest`, `writeManifest`, `findRepoRoot` (loaders.ts); `componentSourcePaths` (paths.ts)
- Produces: `deleteComponent(slug: string, root?: string): string[]`

- [ ] **Step 1: Write the failing test**

Create `packages/codegen/test/delete.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { deleteComponent } from "../src/delete";

function repo(): string {
  const root = mkdtempSync(join(tmpdir(), "delete-"));
  writeFileSync(join(root, "design-system.manifest.json"), JSON.stringify({
    components: [{ slug: "button", name: "Button", isIcon: false }, { slug: "chip", name: "Chip", isIcon: false }],
    icons: [{ slug: "plus", name: "Plus", isIcon: true }],
  }));
  const cdir = join(root, "packages/components/src");
  mkdirSync(join(cdir, "components/button"), { recursive: true });
  writeFileSync(join(cdir, "components/button/Button.tsx"), "export const Button = () => null;");
  writeFileSync(join(cdir, "index.ts"),
    `export { Button } from "./components/button";\nexport type { ButtonProps } from "./components/button";\n`);
  return root;
}

test("removes dir, manifest entry, and barrel lines when present", () => {
  const root = repo();
  deleteComponent("button", root);
  const m = JSON.parse(readFileSync(join(root, "design-system.manifest.json"), "utf8"));
  assert.deepEqual(m.components.map((e: { slug: string }) => e.slug), ["chip"]);
  assert.equal(existsSync(join(root, "packages/components/src/components/button")), false);
  const barrel = readFileSync(join(root, "packages/components/src/index.ts"), "utf8");
  assert.equal(barrel.includes("./components/button"), false);
});

test("no-op on barrel when the component was never barrelled", () => {
  const root = repo();
  const changed = deleteComponent("chip", root); // chip has no dir, no barrel line
  const m = JSON.parse(readFileSync(join(root, "design-system.manifest.json"), "utf8"));
  assert.deepEqual(m.components.map((e: { slug: string }) => e.slug), ["button"]);
  const barrel = readFileSync(join(root, "packages/components/src/index.ts"), "utf8");
  assert.equal(barrel.includes("./components/button"), true); // untouched
  assert.equal(changed.some((p) => p.endsWith("index.ts")), false);
});

test("throws on a slug not in the manifest", () => {
  const root = repo();
  assert.throws(() => deleteComponent("nope", root), /not in/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/packages/codegen && corepack pnpm exec tsx --test test/delete.test.ts`
Expected: FAIL — cannot find module `../src/delete`.

- [ ] **Step 3: Write minimal implementation**

Create `packages/codegen/src/delete.ts`:
```ts
import { rmSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { findRepoRoot, loadManifest, writeManifest, MANIFEST_FILE } from "./loaders";
import { componentSourcePaths } from "./paths";

/**
 * Fully remove a component from the repo: its manifest entry, its source dir,
 * and any root-barrel export line referencing it. Returns the changed paths.
 * Throws if the slug is not in the manifest. Barrel removal is defensive -- a
 * no-op when the component was never barrelled (generate does not add barrel
 * lines today), but it prevents a broken build for one that was (e.g. Button).
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

  const relDir = componentSourcePaths(slug, entry.isIcon).dir; // "src/components/<slug>"
  const absDir = join(root, "packages", "components", relDir);
  if (existsSync(absDir)) {
    rmSync(absDir, { recursive: true, force: true });
    changed.push(absDir);
  }

  const barrelPath = join(root, "packages", "components", "src", "index.ts");
  if (existsSync(barrelPath)) {
    const marker = `./${entry.isIcon ? "icons" : "components"}/${slug}"`;
    const lines = readFileSync(barrelPath, "utf8").split("\n");
    const kept = lines.filter((line) => !line.includes(marker));
    if (kept.length !== lines.length) {
      writeFileSync(barrelPath, kept.join("\n"));
      changed.push(barrelPath);
    }
  }
  return changed;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/packages/codegen && corepack pnpm exec tsx --test test/delete.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Wire the `delete` subcommand into the CLI**

In `packages/codegen/src/cli.ts`:
- Add the import near the other `./`-imports: `import { deleteComponent } from "./delete";`
- Add a `delete` block in `main()`, immediately after the `if (cmd === "sync") return sync();` line:
```ts
  if (cmd === "delete") {
    const slug = argv.slice(1).find((a) => !a.startsWith("-"));
    if (!slug) { console.error("delete needs a <slug>. See `codegen --help`."); return 1; }
    const changed = deleteComponent(slug);
    console.log(`delete: removed ${slug} (${changed.length} paths changed)`);
    return 0;
  }
```
- Add a HELP line under the `codegen sync` entry in the `HELP` string:
```
  codegen delete <slug>              Remove a component from the repo: its
                                     source dir, manifest entry, and barrel
                                     export line. Deterministic, no network.
```

- [ ] **Step 6: Verify CLI + typecheck + build**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/packages/codegen
corepack pnpm exec tsc --noEmit && corepack pnpm test 2>&1 | tail -3 && corepack pnpm build
```
Expected: tsc clean; all codegen tests pass (including the 3 new ones); tsup build succeeds.

- [ ] **Step 7: Commit (needs user OK)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add packages/codegen/src/delete.ts packages/codegen/src/cli.ts packages/codegen/test/delete.test.ts
git commit -m "feat(codegen): delete <slug> command (dir + manifest + barrel)"
```

---

## Task 4: `delete.yml` worker

**Files:**
- Create: `.github/workflows/delete.yml`

- [ ] **Step 1: Create the workflow (copy sync.yml's shape)**

Create `.github/workflows/delete.yml`:
```yaml
name: Delete component
run-name: "delete ${{ inputs.slug }} (job ${{ inputs.jobId }})"

# Dispatched by apps/admin (dispatchDelete) when a user confirms deleting a
# committed component. Runs `codegen delete <slug>` (removes the source dir,
# manifest entry, and barrel line) and opens a delete/<slug> PR.
on:
  workflow_dispatch:
    inputs:
      slug:
        description: "Component slug to delete"
        required: true
        type: string
      jobId:
        description: "Job id from the admin app's Postgres job store, for run correlation"
        required: true
        type: string

permissions:
  contents: write
  pull-requests: write

concurrency:
  group: delete-${{ inputs.slug }}

jobs:
  delete:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      # slug via env, referenced as "$SLUG" -- never interpolated into the run
      # script (injection-safe), matching the other workflows.
      - name: Delete component
        env:
          SLUG: ${{ inputs.slug }}
        run: corepack pnpm --filter @d-2-g-8/codegen codegen delete "$SLUG"

      - name: Open/update PR
        uses: peter-evans/create-pull-request@6d6857d36972b65feb161a90e484f2984215f83e # v6.0.5
        with:
          # A PAT, not GITHUB_TOKEN: the automatic token can't open PRs and its
          # PRs don't trigger ci.yml. Needs Contents + Pull requests write.
          token: ${{ secrets.CREATE_PR_TOKEN }}
          branch: delete/${{ inputs.slug }}
          base: master
          title: "delete: ${{ inputs.slug }}"
          body: "Remove the ${{ inputs.slug }} component (source dir + manifest entry + barrel line)."
          labels: delete
          add-paths: |
            packages/components
            design-system.manifest.json
          commit-message: "delete: ${{ inputs.slug }}"
```

- [ ] **Step 2: Validate YAML**

Run: `cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system && python3 -c "import yaml; yaml.safe_load(open('.github/workflows/delete.yml')); print('YAML OK')"`
Expected: `YAML OK`.

- [ ] **Step 3: Commit (needs user OK)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add .github/workflows/delete.yml
git commit -m "feat(ci): delete.yml worker — codegen delete + delete/<slug> PR"
```

---

## Task 5: Admin server-side delete wiring

**Files:**
- Modify: `apps/admin/lib/github.ts` (add `dispatchDelete`, `getDeletePullRequest`, `listOpenDeletePRs`)
- Modify: `apps/admin/lib/design-state.ts` (`deletePrUrl` passthrough)
- Modify: `apps/admin/app/actions.ts` (add `deleteComponent`, `mergeDeletePr`)

**Interfaces:**
- Consumes: `dispatchWorkflow` (private, existing), `getConfig`/`githubFetch` (private, existing), `getPullRequestMergeState`, `canMerge`, `mergePullRequest`, `requireSession`, `enqueue`, `setStatus`, `DispatchResult`
- Produces:
  - `dispatchDelete(slug: string, jobId: string): Promise<void>`
  - `getDeletePullRequest(slug: string): Promise<{ number: number; htmlUrl: string; headRef: string } | null>`
  - `listOpenDeletePRs(): Promise<Map<string, string>>` (slug → html_url)
  - `ComponentState.deletePrUrl?: string`
  - `deleteComponent(slug: string): Promise<DispatchResult>`
  - `mergeDeletePr(slug: string): Promise<{ merged: boolean; reason?: string }>`

- [ ] **Step 1: Add the github.ts helpers**

In `apps/admin/lib/github.ts`:
- Add `dispatchDelete` next to `dispatchSync`:
```ts
/** Dispatches the delete.yml worker for a component `slug`, tagged with `jobId`. */
export async function dispatchDelete(slug: string, jobId: string): Promise<void> {
  await dispatchWorkflow("delete.yml", { slug, jobId });
}
```
- Add `getDeletePullRequest` next to `getSyncPullRequest` (mirror it, head `delete/<slug>`):
```ts
/** The open delete/<slug> -> master PR, or null. */
export async function getDeletePullRequest(
  slug: string,
): Promise<{ number: number; htmlUrl: string; headRef: string } | null> {
  const { repo } = getConfig();
  const org = repo.split("/")[0];
  const res = await githubFetch(`/repos/${repo}/pulls?state=open&head=${org}:delete/${slug}`);
  if (!res.ok) throw new Error(`getDeletePullRequest ${slug}: ${res.status} ${await res.text()}`);
  const prs = (await res.json()) as { number: number; html_url: string; head: { ref: string } }[];
  const pr = prs[0];
  return pr ? { number: pr.number, htmlUrl: pr.html_url, headRef: pr.head.ref } : null;
}
```
- Add `listOpenDeletePRs` next to `listOpenCodegenPRs` (map slug → url):
```ts
/** Open PRs whose head branch is `delete/*` -> Map<slug, html_url>. */
export async function listOpenDeletePRs(): Promise<Map<string, string>> {
  const { repo } = getConfig();
  const res = await githubFetch(`/repos/${repo}/pulls?state=open&per_page=100`);
  if (!res.ok) throw new Error(`listOpenDeletePRs: ${res.status} ${await res.text()}`);
  const prs = (await res.json()) as { head: { ref: string }; html_url: string }[];
  const map = new Map<string, string>();
  for (const pr of prs) {
    const ref = pr.head?.ref ?? "";
    if (ref.startsWith("delete/")) map.set(ref.slice("delete/".length), pr.html_url);
  }
  return map;
}
```

- [ ] **Step 2: Thread `deletePrUrl` through design-state.ts**

In `apps/admin/lib/design-state.ts`:
- Add `deletePrUrl?: string;` to the `ComponentState` interface.
- Extend the `./github` import to include `listOpenDeletePRs`.
- Add a 5th, optional param to `deriveComponentState` and set the field (existing 4-arg calls in the test keep working):
```ts
export function deriveComponentState(
  manifest: Manifest,
  committedComponents: string[],
  committedIcons: string[],
  prsByBranch: Map<string, string>,
  deletePrs: Map<string, string> = new Map(),
): ComponentState[] {
  const all = [...(manifest.components ?? []), ...(manifest.icons ?? [])];
  return all.map((e) => {
    const deletePrUrl = deletePrs.get(e.slug);
    const committed = (e.isIcon ? committedIcons : committedComponents).includes(e.slug);
    if (committed) return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "committed", deletePrUrl };
    const prUrl = prsByBranch.get(`codegen/${e.slug}`);
    if (prUrl) return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "pending", prUrl, deletePrUrl };
    return { slug: e.slug, name: e.name, isIcon: e.isIcon, status: "never", deletePrUrl };
  });
}
```
- In `loadComponentState`, add `listOpenDeletePRs()` to the `Promise.all` and pass it in:
```ts
  const [tree, prs, deletePrs] = await Promise.all([listTree("master"), listOpenCodegenPRs(), listOpenDeletePRs()]);
  if (tree.truncated) throw new Error("git tree truncated -- cannot reliably derive committed state");
  const components = committedSlugsFromTree(tree.paths, "packages/components/src/components");
  const icons = committedSlugsFromTree(tree.paths, "packages/components/src/icons");
  return deriveComponentState(manifest, components, icons, prs, deletePrs);
```

- [ ] **Step 3: Add the actions**

In `apps/admin/app/actions.ts`:
- Extend the `@/lib/github` import to include `dispatchDelete`, `getDeletePullRequest`.
- Append:
```ts
/** Enqueue a delete job and dispatch delete.yml. Gated on the session; returns
 *  the error rather than throwing (production redacts thrown action errors). */
export async function deleteComponent(slug: string): Promise<DispatchResult> {
  try {
    await requireSession();
    if (!slug || !slug.trim()) throw new Error("slug is required");
    const job = await enqueue("delete", slug);
    try {
      await dispatchDelete(slug, job.id);
    } catch (e) {
      await setStatus(job.id, "failed", { log: e instanceof Error ? e.message : String(e) });
      throw e;
    }
    return { ok: true, jobId: job.id };
  } catch (e) {
    console.error("deleteComponent failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Merge the open delete/<slug> PR, gated on the session AND re-checked
 *  server-side (mergeable + CI green) immediately before merging. Squash;
 *  head-SHA guarded. Mirrors mergeComponentPr. */
export async function mergeDeletePr(slug: string): Promise<{ merged: boolean; reason?: string }> {
  await requireSession();
  const pr = await getDeletePullRequest(slug);
  if (!pr) return { merged: false, reason: "no open delete PR for this component" };
  const state = await getPullRequestMergeState(pr.number);
  const gate = canMerge(state);
  if (!gate.ok) return { merged: false, reason: gate.reason };
  const res = await mergePullRequest(pr.number, state.headSha);
  return { merged: res.merged, reason: res.message };
}
```

- [ ] **Step 4: Typecheck + tests + build**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin
corepack pnpm exec tsc --noEmit && corepack pnpm test && AUTH_SECRET=throwaway-build-secret corepack pnpm build
```
Expected: tsc clean; all admin tests pass (the existing `design-state.test.ts` 4-arg calls still work because `deletePrs` defaults); build succeeds.

- [ ] **Step 5: Commit (needs user OK)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/lib/github.ts apps/admin/lib/design-state.ts apps/admin/app/actions.ts
git commit -m "feat(admin): delete dispatch + delete-PR lookup + gated merge action"
```

---

## Task 6: Delete button + row wiring

**Files:**
- Create: `apps/admin/app/components/DeleteButton.tsx`
- Modify: `apps/admin/app/components/SelectableComponents.tsx` (render DeleteButton on committed rows)
- Modify: `apps/admin/app/components/dashboard.module.css` (add `.deleteWrap`, `.buttonDanger`)

**Interfaces:**
- Consumes: `deleteComponent`, `mergeDeletePr` (actions); `ComponentState.deletePrUrl` (Task 5)

- [ ] **Step 1: Create DeleteButton**

Create `apps/admin/app/components/DeleteButton.tsx`:
```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteComponent, mergeDeletePr } from "../actions";
import styles from "./dashboard.module.css";

/** Committed-row control. Two modes: (1) no open delete PR -> "Delete" ->
 *  confirm -> dispatch deleteComponent; (2) an open delete PR -> link + a
 *  "Merge delete" button whose gate is re-checked server-side (reason shown if
 *  not ready). Action calls are wrapped so a throw never shows the raw digest. */
export function DeleteButton({ slug, name, deletePrUrl }: { slug: string; name: string; deletePrUrl?: string }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  if (deletePrUrl) {
    return (
      <span className={styles.deleteWrap}>
        <a href={deletePrUrl} target="_blank" rel="noreferrer">Delete PR ↗</a>
        <button
          type="button"
          className={styles.buttonSecondary}
          disabled={busy}
          onClick={async () => {
            setBusy(true); setErr(null);
            try {
              const res = await mergeDeletePr(slug);
              if (res.merged) router.refresh();
              else setErr(res.reason ?? "not ready");
            } catch (e) {
              setErr(e instanceof Error ? e.message : String(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Merging…" : "Merge delete"}
        </button>
        {err && <span role="alert" className={styles.buttonError}>{err}</span>}
      </span>
    );
  }

  if (!confirming) {
    return (
      <button type="button" className={styles.buttonSecondary} onClick={() => setConfirming(true)}>
        Delete
      </button>
    );
  }

  return (
    <span className={styles.deleteWrap}>
      <span>Delete {name}? Removes its code + catalog entry (the next Sync re-adds it as a seed).</span>
      <button
        type="button"
        className={styles.buttonDanger}
        disabled={busy}
        onClick={async () => {
          setBusy(true); setErr(null);
          try {
            const res = await deleteComponent(slug);
            if (res.ok) router.refresh();
            else setErr(res.error);
          } catch (e) {
            setErr(e instanceof Error ? e.message : String(e));
          } finally {
            setBusy(false);
            setConfirming(false);
          }
        }}
      >
        {busy ? "Dispatching…" : "Confirm delete"}
      </button>
      <button type="button" className={styles.buttonSecondary} disabled={busy} onClick={() => setConfirming(false)}>
        Cancel
      </button>
      {err && <span role="alert" className={styles.buttonError}>{err}</span>}
    </span>
  );
}
```

- [ ] **Step 2: Render it in the row action cell**

In `apps/admin/app/components/SelectableComponents.tsx`:
- Add the import: `import { DeleteButton } from "./DeleteButton";`
- In the action cell (`<td className={styles.actionCell}>`), after the existing `<GenerateButton ... />`, add:
```tsx
                  {c.status === "committed" && (
                    <DeleteButton slug={c.slug} name={c.name} deletePrUrl={c.deletePrUrl} />
                  )}
```

- [ ] **Step 3: Add the CSS**

Append to `apps/admin/app/components/dashboard.module.css`:
```css
.deleteWrap { display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.buttonDanger { background: #d64545; color: #fff; border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer; }
.buttonDanger:disabled { opacity: 0.6; cursor: default; }
```

- [ ] **Step 4: Typecheck + build**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin
corepack pnpm exec tsc --noEmit && AUTH_SECRET=throwaway-build-secret corepack pnpm build
```
Expected: tsc clean; build succeeds.
Manual (user-gated): a committed row shows Delete → confirm → dispatches; when the delete PR is open, the row shows "Delete PR ↗" + "Merge delete".

- [ ] **Step 5: Commit (needs user OK)**

```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system
git add apps/admin/app/components/DeleteButton.tsx apps/admin/app/components/SelectableComponents.tsx apps/admin/app/components/dashboard.module.css
git commit -m "feat(admin): delete button + delete-PR merge control on committed rows"
```

---

## Final verification

- [ ] **Full gates green**

Run:
```bash
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/apps/admin && corepack pnpm exec tsc --noEmit && corepack pnpm test && AUTH_SECRET=throwaway-build-secret corepack pnpm build
cd /Users/dariagritsienko/Desktop/daily-prep-anthropic/design-system/packages/codegen && corepack pnpm exec tsc --noEmit && corepack pnpm test && corepack pnpm build
```
Expected: all green (admin tokens-view + delete-related tests, codegen delete tests, both builds).

- [ ] **Open the PR** — `gh` is not installed; give the user the compare URL for `tokens-and-delete → master`. Do NOT push/merge without the user's OK. Ensure the `CREATE_PR_TOKEN` secret already exists (it does, from the sync fix) so delete.yml can open PRs.

## Manual E2E (user-gated, post-deploy)

1. Deploy the branch. Dashboard shows a **Tokens** section (color swatches) below the components table.
2. On a committed component row (e.g. `button`, or any you generated), click **Delete** → **Confirm delete** → a `delete/<slug>` PR opens (job in the panel).
3. Once CI is green, the row shows **Delete PR ↗** + **Merge delete** → click it → the row disappears (component removed from the manifest). A later Sync re-adds it as a `never` seed.
