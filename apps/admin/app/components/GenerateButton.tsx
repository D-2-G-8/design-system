"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateComponent } from "../actions";
import styles from "./dashboard.module.css";

/** Dispatches `generateComponent(slug)`. "Generate" (never-status rows) reads
 *  as the primary, high-contrast action -- it's the actual outstanding work
 *  on this page. "Regenerate" (already-committed rows) is available but
 *  intentionally quieter, so the page has one obvious next step. */
export function GenerateButton({ slug, label }: { slug: string; label: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const isPrimary = label === "Generate";

  return (
    <span>
      <button
        type="button"
        className={`${styles.button} ${isPrimary ? styles.buttonPrimary : styles.buttonSecondary}`}
        disabled={busy}
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
        {busy ? "Dispatching…" : label}
      </button>
      {err && (
        <span role="alert" className={styles.buttonError}>
          {err}
        </span>
      )}
    </span>
  );
}
