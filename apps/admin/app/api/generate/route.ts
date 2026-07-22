import { NextResponse } from "next/server";
import { enqueue, setStatus } from "@/lib/jobs";
import { dispatchGenerate } from "@/lib/github";

/**
 * Enqueues a "generate" job for a component slug and dispatches the
 * generate.yml GitHub Actions workflow to do the actual work. Body:
 * { slug: string }.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const slug = (body as { slug?: unknown })?.slug;
  if (typeof slug !== "string" || slug.trim() === "") {
    return NextResponse.json({ ok: false, error: "`slug` is required" }, { status: 400 });
  }

  try {
    const job = await enqueue("generate", slug);
    try {
      await dispatchGenerate(slug, job.id);
    } catch (dispatchError) {
      await setStatus(job.id, "failed", {
        log: dispatchError instanceof Error ? dispatchError.message : String(dispatchError),
      });
      throw dispatchError;
    }
    return NextResponse.json({ ok: true, jobId: job.id });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
