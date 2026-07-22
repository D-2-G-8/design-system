"use server";

import { auth } from "@/auth";
import { enqueue, setStatus } from "@/lib/jobs";
import { dispatchGenerate, getPullRequestForSlug, getPullRequestMergeState, canMerge, mergePullRequest } from "@/lib/github";
import { syncJob } from "@/lib/jobs-sync";

/**
 * Defense-in-depth for the server actions. Middleware already redirects
 * unauthenticated humans (the `authorized` callback in auth.ts), but server
 * actions are POST endpoints reachable directly, so each one re-checks the
 * session itself rather than trusting that every caller went through a
 * middleware-matched page first.
 */
async function requireSession(): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized -- sign in to use the admin.");
}

/** Enqueue a generate job and dispatch the workflow. Runs server-side, gated
 *  on the signed-in session. */
export async function generateComponent(slug: string): Promise<{ jobId: string }> {
  await requireSession();
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

/** Live job status for the dashboard's polling, gated on the signed-in session. */
export async function getJobStatus(jobId: string) {
  await requireSession();
  return syncJob(jobId);
}

/** Merge a component's PR, gated on the session AND re-checked server-side
 *  (mergeable + CI green) immediately before merging -- never trusts the client
 *  button's enabled state. Squash; head-SHA guarded. */
export async function mergeComponentPr(slug: string): Promise<{ merged: boolean; reason?: string }> {
  await requireSession();
  const pr = await getPullRequestForSlug(slug);
  if (!pr) return { merged: false, reason: "no open PR for this component" };
  const state = await getPullRequestMergeState(pr.number);
  const gate = canMerge(state);
  if (!gate.ok) return { merged: false, reason: gate.reason };
  const res = await mergePullRequest(pr.number, state.headSha);
  return { merged: res.merged, reason: res.message };
}
