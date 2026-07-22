import { test } from "node:test";
import assert from "node:assert/strict";
import { runSync } from "../src/sync";

const deps = {
  getComponents: async () => [{ node_id: "2:1", name: "Outline/Plus", containing_frame: { pageName: "Icons" } }],
  getComponentSets: async () => [{ node_id: "1:1", name: "🟢 Button", containing_frame: { pageName: "Components" } }],
  getStyles: async () => [],
  resolveNodes: async () => ({}),                 // no set variant children in this fixture
  deriveTokens: async () => ({ tokens: [], colors: 0, radii: 0 }),
};

test("runSync curates into components + icons", async () => {
  const r = await runSync({ fileKey: "F", token: "figd_x", deps } as never);
  assert.equal(r.components.find((c) => c.slug === "button")?.isIcon, false);
  assert.ok(r.icons.length >= 1);
});

test("runSync aborts (throws) on an empty curated result (non-empty guard)", async () => {
  await assert.rejects(runSync({ fileKey: "F", token: "figd_x", deps: { ...deps, getComponents: async () => [], getComponentSets: async () => [] } } as never));
});

test("runSync excludes a set's variant children from standalone components (no duplicate icons)", async () => {
  // An icon SET on an 'Icons' page whose variant children ALSO appear in the
  // /components list: the children must NOT be emitted a second time as
  // standalone icons (childNodeIdsInSets exclusion).
  const r = await runSync({
    fileKey: "F",
    token: "figd_x",
    deps: {
      ...deps,
      getComponentSets: async () => [{ node_id: "9:0", name: "Star", containing_frame: { pageName: "Icons" } }],
      // These two ARE the set's variant children — must be filtered out of standalone comps.
      getComponents: async () => [
        { node_id: "9:1", name: "Style=Outline", containing_frame: { pageName: "Icons" } },
        { node_id: "9:2", name: "Style=Fill", containing_frame: { pageName: "Icons" } },
      ],
      resolveNodes: async () => ({ "9:0": { children: [{ id: "9:1", name: "Style=Outline" }, { id: "9:2", name: "Style=Fill" }] } }),
    },
  } as never);
  // Exactly one icon (the set), not three (set + 2 leaked children).
  assert.equal(r.icons.length, 1);
  assert.equal(r.icons[0].slug, "star");
});
