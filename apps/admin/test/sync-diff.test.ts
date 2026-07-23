import { test } from "node:test";
import assert from "node:assert/strict";
import { diffCatalog, diffTokens } from "../lib/sync-diff";

test("catalog diff finds added, removed, renamed by slug", () => {
  const base = {
    components: [
      { slug: "button", name: "Button", isIcon: false },
      { slug: "chip", name: "Chip", isIcon: false },
    ],
    icons: [{ slug: "plus", name: "Plus", isIcon: true }],
  };
  const head = {
    components: [
      { slug: "button", name: "Button", isIcon: false },
      { slug: "badge", name: "Badge", isIcon: false }, // added
      // chip removed
    ],
    icons: [{ slug: "plus", name: "PlusBold", isIcon: true }], // renamed
  };
  const d = diffCatalog(base, head);
  assert.deepEqual(d.components.added.map((e) => e.slug), ["badge"]);
  assert.deepEqual(d.components.removed.map((e) => e.slug), ["chip"]);
  assert.deepEqual(d.icons.renamed, [{ slug: "plus", from: "Plus", to: "PlusBold" }]);
});

test("catalog diff tolerates missing arrays", () => {
  const d = diffCatalog({}, { components: [{ slug: "x", name: "X", isIcon: false }] });
  assert.deepEqual(d.components.added.map((e) => e.slug), ["x"]);
  assert.deepEqual(d.icons.added, []);
});

test("token diff finds added, removed, value-changed", () => {
  const base = {
    "color-000000": { category: "color", value: "#000000" },
    "color-fff": { category: "color", value: "#ffffff" },
  };
  const head = {
    "color-000000": { category: "color", value: "#111111" }, // changed
    "color-new": { category: "color", value: "#abcabc" }, // added
    // color-fff removed
  };
  const d = diffTokens(base, head);
  assert.deepEqual(d.added, ["color-new"]);
  assert.deepEqual(d.removed, ["color-fff"]);
  assert.deepEqual(d.changed, [{ name: "color-000000", from: "#000000", to: "#111111" }]);
});
