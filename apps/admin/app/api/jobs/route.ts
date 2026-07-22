import { NextResponse } from "next/server";
import { list } from "@/lib/jobs";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;
  try {
    const jobs = await list();
    return NextResponse.json({ ok: true, jobs });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
