import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeTokensJson, writeSeedContract } from "../src/loaders";

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
