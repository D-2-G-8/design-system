import { test } from "node:test";
import assert from "node:assert/strict";
import { runValidationLoop } from "../src/validate";
import { estimateCostUsd } from "../src/models";
import type { GeneratedFiles } from "../src/review";

test("runValidationLoop sums usage across fix rounds", async () => {
  let calls = 0;
  const files = { tsx: "", css: "", stories: "", index: "" };
  const res = await runValidationLoop({
    model: "m",
    component: { slug: "x" } as never,
    contract: {} as never,
    files: files as never,
    tokens: [] as never,
    childContracts: [] as never,
    isIcon: false,
    componentName: "X",
    fileBase: "X",
    uses: [],
    maxRounds: 3,
    typecheck: async () => ({ ok: true, raw: "" }),
    write: async () => {},
    fix: async (f: GeneratedFiles) => { calls++; return { files: f, inputTokens: 5, outputTokens: 3 }; },
    gate: () => (calls < 2 ? [{ id: "t", severity: "build-breaking", file: "x.tsx", message: "bad" }] : []),
  } as never);
  assert.equal(res.passed, true);
  assert.equal(res.inputTokens, 10); // 2 fix rounds * 5
  assert.equal(res.outputTokens, 6);
});

test("estimateCostUsd prices known models and falls back for unknown", () => {
  assert.equal(estimateCostUsd("claude-sonnet-4-5", 1_000_000, 1_000_000), 12); // 2 + 10
  assert.equal(estimateCostUsd("claude-opus-4-5", 1_000_000, 0), 5);
  // unknown -> default (sonnet) fallback, never throws
  assert.equal(estimateCostUsd("nope", 1_000_000, 0), 2);
});
