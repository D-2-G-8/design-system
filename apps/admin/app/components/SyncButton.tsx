"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { syncFromFigma } from "../actions";
import styles from "./dashboard.module.css";

/** Dispatches a whole-library `syncFromFigma()` — reads the Figma library and
 *  opens a PR updating the manifest/tokens/seed-contracts. The dispatched job
 *  appears in the jobs panel (queued → running → done). */
export function SyncButton() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  return (
    <span className={styles.syncWrap}>
      <button
        type="button"
        className={styles.syncBtn}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr(null);
          try {
            const res = await syncFromFigma();
            if (res.ok) {
              router.refresh(); // surface the queued sync job in the panel
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
        {busy ? "Dispatching…" : "Sync from Figma"}
      </button>
      {err && (
        <span role="alert" className={styles.syncError}>
          {err}
        </span>
      )}
    </span>
  );
}
