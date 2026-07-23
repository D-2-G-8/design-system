"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { generateBaseline, getJobStatus } from "../../actions";
import styles from "../review.module.css";

/** "Generate baseline" for a pending component: dispatches the screenshot-only
 *  baseline.yml (no LLM), polls the job, and refreshes the page when it finishes
 *  so the rendered screenshot resolves. Action call is wrapped so a throw never
 *  shows the raw production digest. */
export function BaselineButton({ slug }: { slug: string }) {
  const [state, setState] = useState<"idle" | "running">("idle");
  const [err, setErr] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  async function start() {
    setErr(null);
    let res;
    try {
      res = await generateBaseline(slug);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      return;
    }
    if (!res.ok) { setErr(res.error); return; }
    setState("running");
    const jobId = res.jobId;
    timer.current = setInterval(async () => {
      try {
        const { job } = await getJobStatus(jobId);
        if (job && (job.status === "done" || job.status === "failed")) {
          if (timer.current) clearInterval(timer.current);
          if (job.status === "failed") {
            setState("idle");
            setErr(job.log ?? "baseline run failed");
          } else {
            setState("idle");
            router.refresh();
          }
        }
      } catch { /* transient — keep polling */ }
    }, 5000);
  }

  if (state === "running") {
    return <p className={styles.unavailable}>Generating baseline… (~2 min, building Storybook)</p>;
  }
  return (
    <div className={styles.baselineAction}>
      <button type="button" className={styles.mergeBtn} onClick={start}>
        Generate baseline
      </button>
      {err && <span role="alert" className={styles.mergeError}>{err}</span>}
    </div>
  );
}
