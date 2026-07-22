import { test } from "node:test";
import assert from "node:assert/strict";
import { matchRunByJobId, mapRunToJobStatus, workflowForKind } from "../lib/run-correlation";

test("matchRunByJobId finds the run whose name carries the jobId", () => {
  const runs = [
    { id: 1, name: "generate button (job abc-123)" },
    { id: 2, name: "generate chip (job def-456)" },
  ];
  assert.equal(matchRunByJobId(runs, "def-456")?.id, 2);
  assert.equal(matchRunByJobId(runs, "zzz-000"), null);
  assert.equal(matchRunByJobId([{ id: 3, name: null }], "abc"), null);
});

test("mapRunToJobStatus maps run status/conclusion to a job status", () => {
  assert.equal(mapRunToJobStatus({ status: "in_progress", conclusion: null }), "running");
  assert.equal(mapRunToJobStatus({ status: "queued", conclusion: null }), "running");
  assert.equal(mapRunToJobStatus({ status: "completed", conclusion: "success" }), "done");
  assert.equal(mapRunToJobStatus({ status: "completed", conclusion: "failure" }), "failed");
  assert.equal(mapRunToJobStatus({ status: "completed", conclusion: "cancelled" }), "failed");
});

test("workflowForKind maps sync jobs to sync.yml, everything else to generate.yml", () => {
  assert.equal(workflowForKind("sync"), "sync.yml");
  assert.equal(workflowForKind("generate"), "generate.yml");
  assert.equal(workflowForKind("anything-else"), "generate.yml");
});
