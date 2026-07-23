import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { deleteComponent, removeComponentFiles } from "../src/delete";

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

test("removeComponentFiles removes the dir + barrel lines, leaves siblings", () => {
  const root = mkdtempSync(join(tmpdir(), "delete-"));
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

test("removeComponentFiles does not remove a sibling whose path is a prefix (button vs button-group)", () => {
  const root = mkdtempSync(join(tmpdir(), "delete-"));
  const compDir = join(root, "packages/components/src/components/button");
  mkdirSync(compDir, { recursive: true });
  writeFileSync(join(compDir, "Button.tsx"), "export const Button = () => null;");
  const barrel = join(root, "packages/components/src/index.ts");
  mkdirSync(dirname(barrel), { recursive: true });
  writeFileSync(
    barrel,
    'export { Button } from "./components/button";\n' +
      'export type { ButtonProps } from "./components/button";\n' +
      'export { ButtonGroup } from "./components/button-group";\n' +
      'export type { ButtonGroupProps } from "./components/button-group";\n',
  );

  removeComponentFiles("button", false, root);

  assert.ok(!existsSync(compDir), "button dir removed");
  const kept = readFileSync(barrel, "utf8");
  assert.ok(!kept.includes("./components/button\""), "button barrel lines gone");
  assert.ok(kept.includes("./components/button-group\""), "button-group barrel lines kept");
});

test("removeComponentFiles handles the icon path: dir under src/icons + ./icons/<slug> barrel line", () => {
  const root = mkdtempSync(join(tmpdir(), "delete-"));
  const iconDir = join(root, "packages/components/src/icons/plus");
  mkdirSync(iconDir, { recursive: true });
  writeFileSync(join(iconDir, "Plus.tsx"), "export const Plus = () => null;");
  const barrel = join(root, "packages/components/src/index.ts");
  mkdirSync(dirname(barrel), { recursive: true });
  writeFileSync(barrel, 'export { Plus } from "./icons/plus";\n');

  const changed = removeComponentFiles("plus", true, root);

  assert.ok(!existsSync(iconDir), "icon dir removed");
  const kept = readFileSync(barrel, "utf8");
  assert.ok(!kept.includes("./icons/plus"), "icon barrel line gone");
  assert.ok(changed.some((p) => p.includes("plus")));
});
