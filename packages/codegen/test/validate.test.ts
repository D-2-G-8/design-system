import { test } from "node:test";
import assert from "node:assert/strict";
import { runValidationLoop } from "../src/validate";
import type { GeneratedFiles } from "../src/review";

const FILES: GeneratedFiles = { tsx: "x", css: "y", stories: "z", index: "i" };

function baseArgs(overrides: Record<string, unknown> = {}) {
  return {
    model: "test-model",
    component: { slug: "button", name: "Button", variants: [], states: [], isIcon: false, uses: [] } as never,
    contract: { props: [], cssVariables: [], classNames: [] },
    files: FILES,
    tokens: [],
    childContracts: new Map(),
    isIcon: false,
    componentName: "Button",
    fileBase: "Button",
    maxRounds: 3,
    // injected side effects (no network/child-process):
    write: async () => {},
    gate: () => [], // deterministic gates report nothing here
    ...overrides,
  };
}

test("clean first pass → passed, 0 fix rounds", async () => {
  const r = await runValidationLoop(baseArgs({ typecheck: async () => ({ ok: true, raw: "" }) }) as never);
  assert.equal(r.passed, true);
  assert.equal(r.rounds, 0);
});

test("red → fix → green within cap", async () => {
  let calls = 0;
  const r = await runValidationLoop(
    baseArgs({
      typecheck: async () => (calls++ === 0 ? { ok: false, raw: "src/components/button/Button.tsx(1,1): error TS1: bad" } : { ok: true, raw: "" }),
      fix: async (files: GeneratedFiles) => ({ files, inputTokens: 0, outputTokens: 0 }),
    }) as never,
  );
  assert.equal(r.passed, true);
  assert.equal(r.rounds, 1);
});

test("still red after 3 rounds → passed=false with findings", async () => {
  let fixes = 0;
  const r = await runValidationLoop(
    baseArgs({
      typecheck: async () => ({ ok: false, raw: "src/components/button/Button.tsx(1,1): error TS1: bad" }),
      fix: async (files: GeneratedFiles) => { fixes++; return { files, inputTokens: 0, outputTokens: 0 }; },
    }) as never,
  );
  assert.equal(r.passed, false);
  assert.equal(r.rounds, 3);
  assert.equal(fixes, 3);
  assert.ok(r.findings.length >= 1);
});

test("icon path is tsc-only: no fix call even when red", async () => {
  let fixes = 0;
  const r = await runValidationLoop(
    baseArgs({
      isIcon: true,
      component: { slug: "plus", name: "Plus", variants: [], states: [], isIcon: true, uses: [] },
      componentName: "Plus", fileBase: "Plus",
      typecheck: async () => ({ ok: false, raw: "src/icons/plus/Plus.tsx(1,1): error TS1: bad" }),
      fix: async (files: GeneratedFiles) => { fixes++; return { files, inputTokens: 0, outputTokens: 0 }; },
    }) as never,
  );
  assert.equal(r.passed, false);
  assert.equal(fixes, 0); // never fixes an icon
  assert.ok(r.findings.length >= 1);
});
