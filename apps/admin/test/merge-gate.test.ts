import { test } from "node:test";
import assert from "node:assert/strict";
import { canMerge, summarizeChecks } from "../lib/github";

test("summarizeChecks: all-pass, one-fail, in-progress", () => {
  assert.deepEqual(summarizeChecks([{ status: "completed", conclusion: "success" }, { status: "completed", conclusion: "skipped" }]), { green: true, summary: "2 passing" });
  assert.deepEqual(summarizeChecks([{ status: "completed", conclusion: "success" }, { status: "completed", conclusion: "failure", name: "visual" }]), { green: false, summary: "1 failing: visual" });
  assert.deepEqual(summarizeChecks([{ status: "in_progress", conclusion: null, name: "ci" }]), { green: false, summary: "1 running: ci" });
  assert.deepEqual(summarizeChecks([]), { green: false, summary: "no checks reported" });
});

test("summarizeChecks: truncation (total_count > fetched) fails closed, not green", () => {
  // All fetched runs pass, but the API says there are more than we read → block.
  const r = summarizeChecks([{ status: "completed", conclusion: "success" }], 31);
  assert.equal(r.green, false);
  assert.match(r.summary, /cannot confirm green/i);
  // total_count == fetched → not truncated → green as normal.
  assert.equal(summarizeChecks([{ status: "completed", conclusion: "success" }], 1).green, true);
});

test("canMerge: only ok when mergeable + no conflicts + ci green", () => {
  assert.equal(canMerge({ mergeable: true, conflicts: false, ciGreen: true }).ok, true);
  assert.equal(canMerge({ mergeable: true, conflicts: false, ciGreen: false }).ok, false);
  assert.equal(canMerge({ mergeable: true, conflicts: true, ciGreen: true }).ok, false);
  assert.equal(canMerge({ mergeable: null, conflicts: false, ciGreen: true }).ok, false); // still computing
});

test("canMerge: reason names the blocker", () => {
  assert.match(canMerge({ mergeable: true, conflicts: false, ciGreen: false }).reason, /CI/i);
  assert.match(canMerge({ mergeable: true, conflicts: true, ciGreen: true }).reason, /conflict/i);
  assert.match(canMerge({ mergeable: null, conflicts: false, ciGreen: true }).reason, /comput/i);
});
