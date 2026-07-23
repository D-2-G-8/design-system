import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeTokensJson, writeSeedContract, writeManifest, type ManifestEntry } from "../src/loaders";
import { writeSync } from "../src/sync";

function repo(): string {
  const root = mkdtempSync(join(tmpdir(), "sync-write-"));
  writeFileSync(join(root, "design-system.manifest.json"), JSON.stringify({ components: [], icons: [] }));
  mkdirSync(join(root, "tokens"), { recursive: true });
  return root;
}

/** A minimal ManifestEntry for a slug -- name==slug, no Figma node ids. */
function m(slug: string): ManifestEntry {
  return { name: slug, slug, isIcon: false, figmaNodeIds: [] };
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

test("writeSync removes a seed-only orphan and reports a committed orphan", () => {
  const root = repo();
  // seed OLD manifest: button (kept), chip (seed-only orphan), avatar (committed orphan)
  writeManifest({ components: [m("button"), m("chip"), m("avatar")], icons: [] }, root);

  // avatar has generated code; chip is seed-only (contract.json only, no .tsx)
  const avatarDir = join(root, "packages/components/src/components/avatar");
  mkdirSync(avatarDir, { recursive: true });
  writeFileSync(join(avatarDir, "Avatar.tsx"), "export const Avatar = () => null;");
  const chipDir = join(root, "packages/components/src/components/chip");
  mkdirSync(chipDir, { recursive: true });
  writeFileSync(join(chipDir, "chip.contract.json"), "{}");

  const result = {
    components: [m("button")],
    icons: [],
    contracts: [],
    tokens: [],
    tokensSkipped: 0,
  };
  const out = writeSync(result as any, root);

  assert.ok(!existsSync(chipDir), "seed-only orphan dir removed");
  assert.ok(existsSync(avatarDir), "committed orphan dir preserved");
  assert.deepEqual(out.orphanedCommitted, ["avatar"]);
  assert.ok(out.removed.some((p) => p.includes("chip")));
});
