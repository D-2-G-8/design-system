"use server";

import { enqueue, setStatus } from "@/lib/jobs";
import { dispatchGenerate } from "@/lib/github";
import { syncJob } from "@/lib/jobs-sync";

/** Enqueue a generate job and dispatch the workflow. Runs server-side (the
 *  browser holds no token; humans are gated by Vercel deployment protection). */
export async function generateComponent(slug: string): Promise<{ jobId: string }> {
  if (!slug || !slug.trim()) throw new Error("slug is required");
  const job = await enqueue("generate", slug);
  try {
    await dispatchGenerate(slug, job.id);
  } catch (e) {
    await setStatus(job.id, "failed", { log: e instanceof Error ? e.message : String(e) });
    throw e;
  }
  return { jobId: job.id };
}

/** Live job status for the dashboard's polling (server action → no browser token). */
export async function getJobStatus(jobId: string) {
  return syncJob(jobId);
}
