import { test } from "node:test";
import assert from "node:assert/strict";
import { committedSlugsFromTree } from "../lib/committed";

const BASE = "packages/components/src/components";

test("a dir with only a contract seed is NOT committed", () => {
  const paths = [`${BASE}/accordion/accordion.contract.json`];
  assert.deepEqual(committedSlugsFromTree(paths, BASE), []);
});

test("a dir with a .tsx IS committed", () => {
  const paths = [
    `${BASE}/button/button.contract.json`,
    `${BASE}/button/Button.tsx`,
  ];
  assert.deepEqual(committedSlugsFromTree(paths, BASE), ["button"]);
});

test("a dir with index.ts IS committed", () => {
  const paths = [`${BASE}/chip/index.ts`];
  assert.deepEqual(committedSlugsFromTree(paths, BASE), ["chip"]);
});

test("only real-code slugs are returned, seeds excluded", () => {
  const paths = [
    `${BASE}/button/Button.tsx`,
    `${BASE}/accordion/accordion.contract.json`,
    `${BASE}/chip/index.ts`,
  ];
  assert.deepEqual(committedSlugsFromTree(paths, BASE).sort(), ["button", "chip"]);
});

test("paths outside baseDir and files directly in baseDir are ignored", () => {
  const paths = [
    `${BASE}.json`,
    `${BASE}/README.md`,
    `packages/components/src/icons/plus/Plus.tsx`,
  ];
  assert.deepEqual(committedSlugsFromTree(paths, BASE), []);
});
