import type { JobStatus } from "./jobs";

/** Find the workflow run whose run-name carries this jobId
 *  ("generate <slug> (job <jobId>)"). Null when it hasn't appeared yet. */
export function matchRunByJobId<T extends { name: string | null }>(runs: T[], jobId: string): T | null {
  const needle = `(job ${jobId})`;
  return runs.find((r) => r.name?.includes(needle)) ?? null;
}

/** The GitHub Actions workflow file a job of a given `kind` runs on -- used to
 *  correlate the job to its run (each workflow's runs are listed separately).
 *  `sync` → sync.yml; `delete` → delete.yml; everything else → generate.yml. */
export function workflowForKind(kind: string): string {
  if (kind === "sync") return "sync.yml";
  if (kind === "delete") return "delete.yml";
  return "generate.yml";
}

/** Map a GitHub run's status/conclusion to our coarse job status. The
 *  needs-human nuance lives on the PR label, not here. */
export function mapRunToJobStatus(run: { status: string | null; conclusion: string | null }): JobStatus {
  if (run.status !== "completed") return "running";
  return run.conclusion === "success" ? "done" : "failed";
}
