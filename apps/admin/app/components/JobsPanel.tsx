"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getJobStatus } from "../actions";
import type { Job } from "@/lib/jobs";
import { formatTokens } from "@/lib/format";
import styles from "./dashboard.module.css";

const STATUS_LABEL: Record<Job["status"], string> = {
  queued: "Queued",
  running: "Running",
  done: "Done",
  failed: "Failed",
};

const ROW_CLASS: Record<Job["status"], string> = {
  queued: styles.jobQueued,
  running: styles.jobRunning,
  done: styles.jobDone,
  failed: styles.jobFailed,
};

function formatCreated(value: Date | string): string {
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Live activity feed for generate jobs. Polls `getJobStatus(jobId)` every
 *  ~4s for jobs still queued/running, stops once every job is terminal.
 *  A freshly-dispatched job appears without a manual reload: the Sync/Generate
 *  buttons call `router.refresh()`, which re-runs the server component and
 *  hands us a new `initialJobs` -- the effect below re-seeds state from it. */
export function JobsPanel({ initialJobs, repo }: { initialJobs: Job[]; repo: string | null }) {
  const [jobs, setJobs] = useState(initialJobs);
  const router = useRouter();

  // `useState` only seeds on first mount, so a new `initialJobs` from a
  // `router.refresh()` (e.g. right after dispatching a sync) would otherwise be
  // ignored until a full page reload. Re-sync whenever the server sends a fresh
  // list -- the polling effect below then picks up any still-active jobs.
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  useEffect(() => {
    const active = jobs.filter((j) => j.status === "queued" || j.status === "running").map((j) => j.id);
    if (active.length === 0) return;
    const t = setInterval(async () => {
      const results = await Promise.all(active.map((id) => getJobStatus(id).then((r) => r.job).catch(() => null)));
      setJobs((prev) => prev.map((j) => results.find((r) => r?.id === j.id) ?? j));
      // A job that just reached a terminal state means its workflow finished --
      // and with it the PR it opened (generate/delete) or the merge it did. Pull
      // fresh server state so the component rows (PR links, status, delete-PR
      // controls) update without a manual reload.
      if (results.some((r) => r && (r.status === "done" || r.status === "failed"))) {
        router.refresh();
      }
    }, 4000);
    return () => clearInterval(t);
  }, [jobs, router]);

  return (
    <section className={styles.section} aria-labelledby="jobs-heading">
      <h2 id="jobs-heading" className={styles.sectionHeading}>
        Recent jobs
        <span className={styles.sectionCount}>{jobs.length}</span>
      </h2>
      {jobs.length === 0 ? (
        <p className={styles.empty}>No jobs yet. Generate a component above to start one.</p>
      ) : (
        <div className={styles.jobsList} aria-label="Recent jobs">
          {jobs.map((j) => (
            <div key={j.id} className={`${styles.jobRow} ${ROW_CLASS[j.status]}`}>
              <span className={styles.jobStatus}>
                <span className={styles.jobDot} aria-hidden="true" />
                {STATUS_LABEL[j.status]}
              </span>
              <span className={styles.jobMain}>
                <span className={styles.jobSlug}>{j.slug}</span>
                <span className={styles.jobMeta}>
                  <span>{j.kind}</span>
                  {j.workflow_run_id &&
                    (repo ? (
                      <a
                        className={styles.jobRunLink}
                        href={`https://github.com/${repo}/actions/runs/${j.workflow_run_id}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        run {j.workflow_run_id}
                      </a>
                    ) : (
                      <span>run {j.workflow_run_id}</span>
                    ))}
                </span>
                {j.input_tokens != null && j.input_tokens > 0 && (
                  <span className={styles.jobUsage}>
                    in {formatTokens(j.input_tokens)} / out {formatTokens(j.output_tokens ?? 0)}
                    {j.cost_usd != null && ` · ~$${j.cost_usd.toFixed(2)}`}
                  </span>
                )}
                {j.status === "running" && (
                  <span className={styles.jobProgress}>
                    <span
                      className={styles.jobProgressFill}
                      style={{ width: `${Math.min(100, Math.max(0, j.progress))}%` }}
                    />
                  </span>
                )}
              </span>
              <span className={styles.jobDetail}>{j.status === "failed" && j.log ? j.log : ""}</span>
              <span className={styles.jobCreated}>{formatCreated(j.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
