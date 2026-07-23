"use server";

import { auth } from "@/auth";
import { enqueue, setStatus } from "@/lib/jobs";
import {
  dispatchGenerate, dispatchSync, getPullRequestForSlug, getPullRequestMergeState,
  canMerge, mergePullRequest, getSyncPullRequest, closePullRequest,
} from "@/lib/github";
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

/**
 * Result shape for the dispatch actions. These RETURN the failure instead of
 * throwing: a thrown Error in a server action is redacted to a generic
 * "digest" message in production, hiding the real cause from the UI. Returning
 * the message keeps it intact all the way to the button's error slot.
 */
export type DispatchResult = { ok: true; jobId: string } | { ok: false; error: string };

/** Enqueue a generate job and dispatch the workflow. Runs server-side, gated
 *  on the signed-in session. Returns the error rather than throwing so the UI
 *  shows the real message (production redacts thrown server-action errors). */
export async function generateComponent(slug: string): Promise<DispatchResult> {
  try {
    await requireSession();
    if (!slug || !slug.trim()) throw new Error("slug is required");
    const job = await enqueue("generate", slug);
    try {
      await dispatchGenerate(slug, job.id);
    } catch (e) {
      await setStatus(job.id, "failed", { log: e instanceof Error ? e.message : String(e) });
      throw e;
    }
    return { ok: true, jobId: job.id };
  } catch (e) {
    console.error("generateComponent failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

/** Live job status for the dashboard's polling, gated on the signed-in session. */
export async function getJobStatus(jobId: string) {
  await requireSession();
  return syncJob(jobId);
}

/** Enqueue a whole-library Figma sync job and dispatch sync.yml. Gated on the
 *  signed-in session; the run opens a PR updating the manifest/tokens/contracts.
 *  Returns the error rather than throwing so the UI shows the real message
 *  (production redacts thrown server-action errors to a generic digest). */
export async function syncFromFigma(): Promise<DispatchResult> {
  try {
    await requireSession();
    const job = await enqueue("sync", "figma");
    try {
      await dispatchSync(job.id);
    } catch (e) {
      await setStatus(job.id, "failed", { log: e instanceof Error ? e.message : String(e) });
      throw e;
    }
    return { ok: true, jobId: job.id };
  } catch (e) {
    console.error("syncFromFigma failed:", e);
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
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

/** Merge the open sync/figma PR into master. Gated on the session AND re-checked
 *  server-side (mergeable + CI green) immediately before merging -- never trusts
 *  the client button's enabled state. Head-SHA guarded (squash). */
export async function acceptSyncPr(): Promise<{ merged: boolean; reason?: string }> {
  await requireSession();
  const pr = await getSyncPullRequest();
  if (!pr) return { merged: false, reason: "no open sync PR" };
  const state = await getPullRequestMergeState(pr.number);
  const gate = canMerge(state);
  if (!gate.ok) return { merged: false, reason: gate.reason };
  const res = await mergePullRequest(pr.number, state.headSha);
  return { merged: res.merged, reason: res.message };
}

/** Close the open sync/figma PR without merging (a fresh Resync re-opens it). */
export async function closeSyncPr(): Promise<{ closed: boolean; reason?: string }> {
  await requireSession();
  const pr = await getSyncPullRequest();
  if (!pr) return { closed: false, reason: "no open sync PR" };
  await closePullRequest(pr.number);
  return { closed: true };
}
