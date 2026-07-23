import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { setUsage } from "@/lib/jobs";

/** POST /api/jobs/[id]/usage -- the generate worker reports token usage + cost
 *  for a job. Bearer-authed (ADMIN_TOKEN). Body: {inputTokens, outputTokens, costUsd}. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  // Strict typeof checks, not Number() coercion: Number(null)/Number("")/Number(false)
  // are all 0 and would let a malformed body write 0/0/0 instead of a 400.
  const { inputTokens, outputTokens, costUsd } = b;
  const ok =
    typeof inputTokens === "number" && Number.isInteger(inputTokens) && inputTokens >= 0 &&
    typeof outputTokens === "number" && Number.isInteger(outputTokens) && outputTokens >= 0 &&
    typeof costUsd === "number" && Number.isFinite(costUsd) && costUsd >= 0;
  if (!ok) {
    return NextResponse.json(
      { ok: false, error: "inputTokens/outputTokens (non-neg ints) and costUsd (non-neg number) required" },
      { status: 400 },
    );
  }

  await setUsage(id, {
    inputTokens: inputTokens as number,
    outputTokens: outputTokens as number,
    costUsd: costUsd as number,
  });
  return NextResponse.json({ ok: true });
}
