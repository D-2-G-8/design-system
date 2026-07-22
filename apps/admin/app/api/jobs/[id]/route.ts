import { NextResponse } from "next/server";
import { get, setStatus } from "@/lib/jobs";
import { getWorkflowRun, findRunByJobId } from "@/lib/github";
import { mapRunToJobStatus } from "@/lib/run-correlation";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;

  try {
    const job = await get(id);
    if (!job) {
      return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
    }

    // Job row is still authoritative even if the run lookup fails
    // (e.g. GITHUB_TOKEN missing/expired) -- surface it, don't 500.
    let run: unknown = null;
    let runId = job.workflow_run_id;
    if (!runId) {
      // workflow_dispatch doesn't return a run id, so on first poll we
      // correlate by listing generate.yml runs and matching the run-name.
      try {
        const found = await findRunByJobId(id);
        if (found) {
          runId = String(found.id);
          await setStatus(id, mapRunToJobStatus(found), { workflow_run_id: runId });
          run = found;
        }
      } catch (e) {
        run = { error: e instanceof Error ? e.message : String(e) };
      }
    }
    if (runId && !run) {
      try {
        const fetched = await getWorkflowRun(runId);
        await setStatus(id, mapRunToJobStatus(fetched));
        run = fetched;
      } catch (e) {
        run = { error: e instanceof Error ? e.message : String(e) };
      }
    }

    const fresh = (await get(id)) ?? job;
    return NextResponse.json({ ok: true, job: fresh, run });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
