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
