import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveComponentState } from "../lib/design-state";

const manifest = {
  components: [
    { slug: "button", name: "Button", isIcon: false },
    { slug: "chip", name: "Chip", isIcon: false },
    { slug: "dialog", name: "Dialog", isIcon: false },
  ],
  icons: [{ slug: "plus", name: "Plus", isIcon: true }],
};

test("committed when the component's dir exists on master", () => {
  const s = deriveComponentState(manifest, ["button"], [], new Map());
  assert.equal(s.find((c) => c.slug === "button")?.status, "committed");
});

test("pending when an open codegen/<slug> PR exists and no dir", () => {
  const s = deriveComponentState(manifest, ["button"], [], new Map([["codegen/chip", "https://gh/pr/2"]]));
  const chip = s.find((c) => c.slug === "chip");
  assert.equal(chip?.status, "pending");
  assert.equal(chip?.prUrl, "https://gh/pr/2");
});

test("never when neither a dir nor a PR", () => {
  const s = deriveComponentState(manifest, ["button"], [], new Map());
  assert.equal(s.find((c) => c.slug === "dialog")?.status, "never");
});

test("icons use the icons dir list, not the components list", () => {
  const s = deriveComponentState(manifest, [], ["plus"], new Map());
  assert.equal(s.find((c) => c.slug === "plus")?.status, "committed");
});

test("a dir AND a PR resolves as committed (dir wins)", () => {
  const s = deriveComponentState(manifest, ["button"], [], new Map([["codegen/button", "https://gh/pr/1"]]));
  assert.equal(s.find((c) => c.slug === "button")?.status, "committed");
});
