"use server";

import { enqueue, setStatus } from "@/lib/jobs";
import { dispatchGenerate } from "@/lib/github";
import { syncJob } from "@/lib/jobs-sync";

/**
 * Defense-in-depth for the server actions. The browser holds no token, so these
 * actions can't AUTHENTICATE the caller -- Vercel deployment protection is the
 * human gate. But if that's misconfigured (off, a preview environment left
 * unprotected, or "Protection Bypass for Automation" enabled), an unguarded
 * action would be a public POST that dispatches paid LLM/Figma/CI work (or leaks
 * job data). So we fail CLOSED unless the deployment is intentionally configured
 * for privileged use -- ADMIN_TOKEN present, the same fail-closed signal
 * lib/auth uses for the /api routes. This is a CONFIG gate, not authentication:
 * keep Vercel deployment protection ON across ALL environments (production AND
 * preview) -- see apps/admin/README.md.
 */
function assertConfigured(): void {
  if (!process.env.ADMIN_TOKEN) {
    throw new Error(
      "Admin not configured: ADMIN_TOKEN is unset. Set it and enable Vercel deployment " +
        "protection (all environments) before using the dashboard's privileged actions.",
    );
  }
}

/** Enqueue a generate job and dispatch the workflow. Runs server-side (the
 *  browser holds no token; humans are gated by Vercel deployment protection). */
export async function generateComponent(slug: string): Promise<{ jobId: string }> {
  assertConfigured();
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
  assertConfigured();
  return syncJob(jobId);
}
