"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteComponent, mergeDeletePr } from "../actions";
import styles from "./dashboard.module.css";

/** Committed-row control. Two modes: (1) no open delete PR -> "Delete" ->
 *  confirm -> dispatch deleteComponent; (2) an open delete PR -> link + a
 *  "Merge delete" button whose gate is re-checked server-side (reason shown if
 *  not ready). Action calls are wrapped so a throw never shows the raw digest. */
export function DeleteButton({ slug, name, deletePrUrl }: { slug: string; name: string; deletePrUrl?: string }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  if (deletePrUrl) {
    return (
      <span className={styles.deleteWrap}>
        <a href={deletePrUrl} target="_blank" rel="noreferrer">Delete PR ↗</a>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSecondary}`}
          disabled={busy}
          onClick={async () => {
            setBusy(true); setErr(null);
            try {
              const res = await mergeDeletePr(slug);
              if (res.merged) router.refresh();
              else setErr(res.reason ?? "not ready");
            } catch (e) {
              setErr(e instanceof Error ? e.message : String(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Merging…" : "Merge delete"}
        </button>
        {err && <span role="alert" className={styles.buttonError}>{err}</span>}
      </span>
    );
  }

  if (!confirming) {
    return (
      <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => setConfirming(true)}>
        Delete
      </button>
    );
  }

  return (
    <span className={styles.deleteWrap}>
      <span>Delete {name}? Removes its code + catalog entry (the next Sync re-adds it as a seed).</span>
      <button
        type="button"
        className={styles.buttonDanger}
        disabled={busy}
        onClick={async () => {
          setBusy(true); setErr(null);
          try {
            const res = await deleteComponent(slug);
            if (res.ok) { router.refresh(); setConfirming(false); }
            else setErr(res.error);
          } catch (e) {
            setErr(e instanceof Error ? e.message : String(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Dispatching…" : "Confirm delete"}
      </button>
      <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} disabled={busy} onClick={() => setConfirming(false)}>
        Cancel
      </button>
      {err && <span role="alert" className={styles.buttonError}>{err}</span>}
    </span>
  );
}
