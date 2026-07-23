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
