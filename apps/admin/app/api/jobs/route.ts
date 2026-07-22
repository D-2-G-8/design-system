import { NextResponse } from "next/server";
import { list } from "@/lib/jobs";

export async function GET() {
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
