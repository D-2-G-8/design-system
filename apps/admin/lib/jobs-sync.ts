import { get, setStatus, type Job } from "./jobs";
import { findRunByJobId, getWorkflowRun } from "./github";
import { mapRunToJobStatus } from "./run-correlation";

/** Resolve a job's workflow run (correlating by run-name when the id isn't
 *  stored yet), sync the job's status from the run, and return the fresh job.
 *  Never throws on a GitHub outage -- the job row stays authoritative
 *  (a run error is returned as `run = { error }`). */
export async function syncJob(id: string): Promise<{ job: Job | undefined; run: unknown }> {
  const job = await get(id);
  if (!job) return { job: undefined, run: null };
  let run: unknown = null;
  let runId = job.workflow_run_id;
  if (!runId) {
    try {
      const found = await findRunByJobId(id);
      if (found) { runId = String(found.id); await setStatus(id, mapRunToJobStatus(found), { workflow_run_id: runId }); run = found; }
    } catch (e) { run = { error: e instanceof Error ? e.message : String(e) }; }
  }
  if (runId && !run) {
    try {
      const fetched = await getWorkflowRun(runId);
      await setStatus(id, mapRunToJobStatus(fetched));
      run = fetched;
    } catch (e) { run = { error: e instanceof Error ? e.message : String(e) }; }
  }
  const fresh = (await get(id)) ?? job;
  return { job: fresh, run };
}
