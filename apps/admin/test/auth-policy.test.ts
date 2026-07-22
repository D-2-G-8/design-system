import { test } from "node:test";
import assert from "node:assert/strict";
import { isAllowedGitHubUser, parseAllowlist } from "../lib/auth-policy";

test("parseAllowlist: null when unset/empty, trimmed list otherwise", () => {
  assert.equal(parseAllowlist(undefined), null);
  assert.equal(parseAllowlist("  "), null);
  assert.deepEqual(parseAllowlist("alice, bob"), ["alice", "bob"]);
});
test("allowlist present: membership = login in allowlist (org ignored)", () => {
  assert.equal(isAllowedGitHubUser("alice", { allowlist: ["alice"], isOrgMember: false }), true);
  assert.equal(isAllowedGitHubUser("mallory", { allowlist: ["alice"], isOrgMember: true }), false);
});
test("no allowlist: falls through to org membership", () => {
  assert.equal(isAllowedGitHubUser("alice", { allowlist: null, isOrgMember: true }), true);
  assert.equal(isAllowedGitHubUser("alice", { allowlist: null, isOrgMember: false }), false);
});
