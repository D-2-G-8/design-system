import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { syncJob } from "@/lib/jobs-sync";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  const { id } = await params;

  try {
    const { job, run } = await syncJob(id);
    if (!job) return NextResponse.json({ ok: false, error: "Job not found" }, { status: 404 });
    return NextResponse.json({ ok: true, job, run });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
