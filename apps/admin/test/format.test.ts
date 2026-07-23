import { test } from "node:test";
import assert from "node:assert/strict";
import { formatTokens } from "../lib/format";

test("formatTokens abbreviates thousands", () => {
  assert.equal(formatTokens(999), "999");
  assert.equal(formatTokens(12345), "12.3k");
  assert.equal(formatTokens(1000), "1.0k");
  assert.equal(formatTokens(0), "0");
});
