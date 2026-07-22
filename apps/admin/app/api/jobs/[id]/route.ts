import { NextResponse } from "next/server";
import { get } from "@/lib/jobs";
import { getWorkflowRun } from "@/lib/github";
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

    let run = null;
    if (job.workflow_run_id) {
      try {
        run = await getWorkflowRun(job.workflow_run_id);
      } catch (runError) {
        // Job row is still authoritative even if the run lookup fails
        // (e.g. GITHUB_TOKEN missing/expired) -- surface it, don't 500.
        run = { error: runError instanceof Error ? runError.message : String(runError) };
      }
    }

    return NextResponse.json({ ok: true, job, run });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
