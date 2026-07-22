import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePropType, parseJsxLiteralProps, parseStoriesArgs } from "../src/review/prop-types";

test("parsePropType recognizes literal unions, booleans, and open types", () => {
  const u = parsePropType("'primary' | 'secondary'");
  assert.equal(u.kind, "literals");
  if (u.kind === "literals") assert.deepEqual([...u.values].sort(), ["primary", "secondary"]);
  assert.equal(parsePropType("boolean").kind, "boolean");
  assert.equal(parsePropType("(e: MouseEvent) => void").kind, "open");
  assert.equal(parsePropType("string").kind, "open");
});

test("parseJsxLiteralProps extracts literal string/boolean attrs and skips expressions", () => {
  const props = parseJsxLiteralProps('<Button variant="primary" disabled onClick={fn} size={sz} />', "Button");
  const byName = Object.fromEntries(props.map((p) => [p.name, p.value]));
  assert.deepEqual(byName.variant, { kind: "string", v: "primary" });
  assert.deepEqual(byName.disabled, { kind: "boolean", v: true });
  assert.equal(byName.onClick.kind, "expr");
  assert.equal(byName.size.kind, "expr");
});

test("parseStoriesArgs reads args object literal values", () => {
  const args = parseStoriesArgs('export const Default = { args: { variant: "secondary", loading: true } };');
  const byName = Object.fromEntries(args.map((p) => [p.name, p.value]));
  assert.deepEqual(byName.variant, { kind: "string", v: "secondary" });
  assert.deepEqual(byName.loading, { kind: "boolean", v: true });
});
