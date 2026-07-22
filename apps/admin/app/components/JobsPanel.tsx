"use client";

import { useEffect, useState } from "react";
import { getJobStatus } from "../actions";
import type { Job } from "@/lib/jobs";
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
 *  Newly-dispatched jobs show up on the next page load, not live here --
 *  keeping 4a simple per the task brief. */
export function JobsPanel({ initialJobs }: { initialJobs: Job[] }) {
  const [jobs, setJobs] = useState(initialJobs);

  useEffect(() => {
    const active = jobs.filter((j) => j.status === "queued" || j.status === "running").map((j) => j.id);
    if (active.length === 0) return;
    const t = setInterval(async () => {
      const results = await Promise.all(active.map((id) => getJobStatus(id).then((r) => r.job).catch(() => null)));
      setJobs((prev) => prev.map((j) => results.find((r) => r?.id === j.id) ?? j));
    }, 4000);
    return () => clearInterval(t);
  }, [jobs]);

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
                  {j.workflow_run_id && <span>run {j.workflow_run_id}</span>}
                </span>
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
