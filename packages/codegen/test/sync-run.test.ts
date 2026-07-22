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
