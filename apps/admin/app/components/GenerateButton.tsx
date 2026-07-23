"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateComponent } from "../actions";
import styles from "./dashboard.module.css";

/** Dispatches `generateComponent(slug)`. "Generate" (never-status rows) reads
 *  as the primary, high-contrast action -- it's the actual outstanding work
 *  on this page. "Regenerate" (already-committed rows) is available but
 *  intentionally quieter, so the page has one obvious next step. */
export function GenerateButton({ slug, label, active = false }: { slug: string; label: string; active?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const isPrimary = label === "Generate";
  // `active` = this component already has a queued/running generate job. Disable
  // so a second dispatch can't stack a duplicate run while the first is in flight.
  const disabled = busy || active;

  return (
    <span>
      <button
        type="button"
        className={`${styles.button} ${isPrimary ? styles.buttonPrimary : styles.buttonSecondary}`}
        disabled={disabled}
        onClick={async () => {
          setBusy(true);
          setErr(null);
          try {
            const res = await generateComponent(slug);
            if (res.ok) {
              router.refresh(); // surface the just-queued job in the panel without a manual reload
            } else {
              setErr(res.error);
            }
          } catch (e) {
            // Transport-level failure (the action itself returns errors, not throws).
            setErr(e instanceof Error ? e.message : String(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Dispatching…" : active ? "Generating…" : label}
      </button>
      {err && (
        <span role="alert" className={styles.buttonError}>
          {err}
        </span>
      )}
    </span>
  );
}
