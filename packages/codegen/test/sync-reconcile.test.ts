import { test } from "node:test";
import assert from "node:assert/strict";
import { findOrphans, isFigmaStale } from "../src/sync-reconcile";

const entry = (slug: string, isIcon = false) => ({ name: slug, slug, isIcon, figmaNodeIds: [] });

test("findOrphans: a seed-only vanished component is removable", () => {
  const old = { components: [entry("button"), entry("chip")], icons: [] };
  const next = { components: [{ slug: "button" }], icons: [] };
  const { removable, committed } = findOrphans(old, next, () => false); // nothing generated
  assert.deepEqual(removable, [{ slug: "chip", isIcon: false }]);
  assert.deepEqual(committed, []);
});

test("findOrphans: a vanished component WITH generated code is reported, not removed", () => {
  const old = { components: [entry("button"), entry("chip")], icons: [] };
  const next = { components: [{ slug: "button" }], icons: [] };
  const { removable, committed } = findOrphans(old, next, (slug) => slug === "chip");
  assert.deepEqual(removable, []);
  assert.deepEqual(committed, ["chip"]);
});

test("findOrphans: icons are classified too", () => {
  const old = { components: [], icons: [entry("plus", true), entry("minus", true)] };
  const next = { components: [], icons: [{ slug: "plus" }] };
  const { removable, committed } = findOrphans(old, next, () => false);
  assert.deepEqual(removable, [{ slug: "minus", isIcon: true }]);
  assert.deepEqual(committed, []);
});

test("findOrphans: no orphans -> empty", () => {
  const old = { components: [entry("button")], icons: [] };
  const next = { components: [{ slug: "button" }], icons: [] };
  const { removable, committed } = findOrphans(old, next, () => true);
  assert.deepEqual(removable, []);
  assert.deepEqual(committed, []);
});

test("isFigmaStale: only when both set and differ", () => {
  assert.equal(isFigmaStale("2026-07-24T00:00:00Z", "2026-07-01T00:00:00Z"), true);
  assert.equal(isFigmaStale("2026-07-24T00:00:00Z", "2026-07-24T00:00:00Z"), false);
  assert.equal(isFigmaStale("2026-07-24T00:00:00Z", undefined), false); // legacy: never stale
  assert.equal(isFigmaStale(undefined, "2026-07-01T00:00:00Z"), false);
  assert.equal(isFigmaStale(undefined, undefined), false);
});
