import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveComponentState } from "../lib/design-state";

const M = (slug: string, figmaUpdatedAt?: string) => ({ slug, name: slug, isIcon: false, figmaUpdatedAt });

test("stale when committed and Figma updated_at differs from contract", () => {
  const manifest = { components: [M("button", "2026-07-24T00:00:00Z")], icons: [] };
  const versions = new Map([["button", "2026-07-01T00:00:00Z"]]); // generated from older
  const [row] = deriveComponentState(manifest, ["button"], [], new Map(), new Map(), versions);
  assert.equal(row.status, "committed");
  assert.equal(row.stale, true);
});

test("not stale when versions match", () => {
  const manifest = { components: [M("button", "2026-07-24T00:00:00Z")], icons: [] };
  const versions = new Map([["button", "2026-07-24T00:00:00Z"]]);
  const [row] = deriveComponentState(manifest, ["button"], [], new Map(), new Map(), versions);
  assert.equal(row.stale, false);
});

test("not stale when contract has no stamp (legacy)", () => {
  const manifest = { components: [M("button", "2026-07-24T00:00:00Z")], icons: [] };
  const versions = new Map<string, string | undefined>([["button", undefined]]);
  const [row] = deriveComponentState(manifest, ["button"], [], new Map(), new Map(), versions);
  assert.equal(row.stale, false);
});

test("not stale when not committed", () => {
  const manifest = { components: [M("button", "2026-07-24T00:00:00Z")], icons: [] };
  const [row] = deriveComponentState(manifest, [], [], new Map(), new Map(), new Map());
  assert.equal(row.status, "never");
  assert.equal(row.stale, false);
});
