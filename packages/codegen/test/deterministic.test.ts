import { test } from "node:test";
import assert from "node:assert/strict";
import { runDeterministicGates } from "../src/review/deterministic";
import type { GeneratedFiles, ReviewContext } from "../src/review/types";
import { buildOwnProps } from "../src/review/prop-types";

function ctx(overrides: Partial<ReviewContext> = {}): ReviewContext {
  return {
    componentName: "Button",
    fileBase: "Button",
    // tokenVarNames holds toCssVarName(token.name) output, which is unprefixed
    // (e.g. "text-primary"), not the CSS custom-property form ("--text-primary")
    // -- gateTokenVars strips the "--" before comparing (see deterministic.ts).
    tokenVarNames: new Set(["text-primary"]),
    ownProps: new Map(),
    composedProps: new Map(),
    expectedComposedImports: new Map(),
    ...overrides,
  };
}

const CLEAN: GeneratedFiles = {
  tsx: `import styles from "./Button.module.scss";\nexport function Button({ variant }: { variant: "primary" | "secondary" }) {\n  return <button className={styles.root} data-variant={variant} />;\n}\n`,
  css: `.root { color: var(--text-primary); }\n`,
  // The self-import must be aliased (`X as Component`), matching what
  // generateStories always produces -- see gateStoriesSelfImport (A1) in
  // deterministic.ts, which flags a bare `import { Button } from "./Button"`
  // as build-breaking regardless of casing.
  stories: `import { Button as Component } from "./Button";\nexport default { title: "Components/Button", component: Component };\nexport const Default = { args: { variant: "primary" } };\n`,
  index: `export { Button } from "./Button";\n`,
};

test("a clean component has no build-breaking findings", () => {
  const findings = runDeterministicGates(CLEAN, ctx());
  assert.equal(findings.filter((f) => f.severity === "build-breaking").length, 0);
});

test("an unknown token var is flagged build-breaking", () => {
  const bad = { ...CLEAN, css: `.root { color: var(--nope-not-a-token); }\n` };
  const findings = runDeterministicGates(bad, ctx());
  assert.ok(findings.some((f) => f.severity === "build-breaking"));
});

test("a story arg outside the prop's literal union is flagged (A7a self value gate)", () => {
  const own = buildOwnProps({ props: [{ name: "variant", type: "'primary' | 'secondary'" }] });
  const bad = { ...CLEAN, stories: CLEAN.stories.replace('variant: "primary"', 'variant: "Primary"') };
  const findings = runDeterministicGates(bad, ctx({ ownProps: own }));
  assert.ok(findings.some((f) => f.severity === "build-breaking"));
});
