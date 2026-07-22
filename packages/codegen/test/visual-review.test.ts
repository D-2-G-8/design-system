import { test } from "node:test";
import assert from "node:assert/strict";
import { runVisualReview } from "../src/visual";
import type { Finding } from "../src/review";

const RENDERED = { bytes: new Uint8Array([9]), mediaType: "image/png" };
const FIGMA = { bytes: new Uint8Array([8]), mediaType: "image/png" };
const FINDING: Finding = { id: "visual-border", severity: "quality", file: "css", message: "[visual/major] border: too round" };

function base(over = {}) {
  return {
    slug: "button", componentName: "Button", fileKey: "F", nodeId: "1:2", token: "figd_x", model: "m",
    readRendered: () => RENDERED,
    fetchImage: async () => FIGMA,
    reviewDiff: async () => ({ findings: [FINDING], inputTokens: 0, outputTokens: 0 }),
    ...over,
  };
}

test("no nodeId → ran:false, no findings", async () => {
  const r = await runVisualReview(base({ nodeId: "" }) as never);
  assert.equal(r.ran, false);
  assert.deepEqual(r.findings, []);
});

test("rendered missing → ran:false", async () => {
  const r = await runVisualReview(base({ readRendered: () => null }) as never);
  assert.equal(r.ran, false);
});

test("figma render unavailable → ran:false", async () => {
  const r = await runVisualReview(base({ fetchImage: async () => null }) as never);
  assert.equal(r.ran, false);
});

test("both images present → ran:true, findings passthrough", async () => {
  const r = await runVisualReview(base() as never);
  assert.equal(r.ran, true);
  assert.equal(r.findings.length, 1);
  assert.equal(r.slug, "button");
});

test("vision returns no findings → ran:true, empty", async () => {
  const r = await runVisualReview(base({ reviewDiff: async () => ({ findings: [], inputTokens: 0, outputTokens: 0 }) }) as never);
  assert.equal(r.ran, true);
  assert.deepEqual(r.findings, []);
});
