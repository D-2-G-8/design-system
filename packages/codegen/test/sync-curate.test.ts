import { test } from "node:test";
import assert from "node:assert/strict";
import { isCuratedComponentName, isLikelyIconName, parseVariantName, buildComponentGroups, uniqueSlug } from "../src/sync-curate";

test("isCuratedComponentName: 🟢 and no slash", () => {
  assert.equal(isCuratedComponentName("🟢 Avatar"), true);
  assert.equal(isCuratedComponentName("🟢 Avatar/Dark/40 px"), false); // published variant dupe
  assert.equal(isCuratedComponentName("Avatar"), false);               // not marked
});

test("isLikelyIconName: page 'Icons' OR /-taxonomy (but not =)", () => {
  assert.equal(isLikelyIconName("Plus", "Icons"), true);
  assert.equal(isLikelyIconName("Outline/Bold/Plus", undefined), true);
  assert.equal(isLikelyIconName("Size=Large", "Components"), false);   // = → variant, not icon
  assert.equal(isLikelyIconName("Button", "Components"), false);
});

test("parseVariantName: key=value pairs, or null", () => {
  assert.deepEqual(parseVariantName("Size=Large, State=Hover"), [{ key: "Size", value: "Large" }, { key: "State", value: "Hover" }]);
  assert.equal(parseVariantName("Just A Name"), null);
});

test("uniqueSlug dedupes with -2/-3", () => {
  const taken = new Set<string>(["tooltip"]);
  assert.equal(uniqueSlug("tooltip", taken), "tooltip-2");
});

test("buildComponentGroups: curates + merges same-name + slugs", () => {
  const groups = buildComponentGroups(
    /* sets */ [{ node_id: "1:1", name: "🟢 Button", containing_frame: { pageName: "Components" } }],
    /* comps */ [
      { node_id: "2:1", name: "Outline/Plus", containing_frame: { pageName: "Icons" } },
      // NOTE: deliberately no "/" in this name -- isLikelyIconName treats ANY
      // "/"-containing, "="-free name as icon-like regardless of page (see its
      // doc comment), so "Deprecated/Old" would itself be curated in as an
      // icon rather than dropped. A "/"-free, non-🟢 name is what actually
      // exercises "not curated, not icon → dropped".
      { node_id: "3:1", name: "Deprecated Old", containing_frame: { pageName: "Junk" } },
    ],
  );
  const button = groups.find((g) => g.slug === "button");
  assert.ok(button && !button.isIcon);
  const plus = groups.find((g) => g.isIcon);
  assert.ok(plus && plus.slug.length > 0);
  assert.equal(groups.find((g) => g.name.includes("Deprecated")), undefined);
});
