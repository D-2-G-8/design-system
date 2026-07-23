import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ensureBarrelExport } from "../src/loaders";

function repo(barrel = `export { Button } from "./components/button";\n`): string {
  const root = mkdtempSync(join(tmpdir(), "barrel-"));
  const src = join(root, "packages/components/src");
  mkdirSync(src, { recursive: true });
  writeFileSync(join(src, "index.ts"), barrel);
  return root;
}
const barrel = (root: string) => readFileSync(join(root, "packages/components/src/index.ts"), "utf8");

test("adds the export + type lines for a new component", () => {
  const root = repo();
  const changed = ensureBarrelExport("chip", false, root);
  assert.ok(changed?.endsWith("index.ts"));
  const b = barrel(root);
  assert.ok(b.includes(`export { Chip } from "./components/chip";`));
  assert.ok(b.includes(`export type { ChipProps } from "./components/chip";`));
  assert.ok(b.includes(`export { Button } from "./components/button";`)); // preserved
});

test("is idempotent -- a second call does not duplicate", () => {
  const root = repo();
  ensureBarrelExport("chip", false, root);
  const after1 = barrel(root);
  const changed2 = ensureBarrelExport("chip", false, root);
  assert.equal(changed2, null);
  assert.equal(barrel(root), after1);
});

test("an icon is exported from ./icons/", () => {
  const root = repo();
  ensureBarrelExport("plus", true, root);
  const b = barrel(root);
  assert.ok(b.includes(`export { Plus } from "./icons/plus";`));
  assert.ok(b.includes(`export type { PlusProps } from "./icons/plus";`));
});

test("a prefix slug does not falsely match a longer one", () => {
  const root = repo(`export { ButtonGroup } from "./components/button-group";\n`);
  const changed = ensureBarrelExport("button", false, root); // must still add button
  assert.ok(changed?.endsWith("index.ts"));
  assert.ok(barrel(root).includes(`export { Button } from "./components/button";`));
});
