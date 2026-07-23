"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteComponent, mergeDeletePr } from "../actions";
import styles from "./dashboard.module.css";

/** Row delete control. Three modes: (1) an open delete PR -> link + a gated
 *  "Merge delete"; (2) not confirming -> a "Delete" trigger; (3) confirming ->
 *  the confirm prompt. `confirming` is controlled by the parent (RowActions) so
 *  it can hide the Generate button while the prompt is open. Action calls are
 *  wrapped so a throw never shows the raw production digest. */
export function DeleteButton({
  slug,
  name,
  deletePrUrl,
  confirming,
  onConfirmingChange,
}: {
  slug: string;
  name: string;
  deletePrUrl?: string;
  confirming: boolean;
  onConfirmingChange: (v: boolean) => void;
}) {
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
      <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => onConfirmingChange(true)}>
        Delete
      </button>
    );
  }

  return (
    <span className={styles.deleteConfirm}>
      <span className={styles.deletePrompt}>
        Delete {name}? Removes its code + catalog entry (re-added on next Sync).
      </span>
      <span className={styles.deleteActions}>
        <button
          type="button"
          className={styles.buttonDanger}
          disabled={busy}
          onClick={async () => {
            setBusy(true); setErr(null);
            try {
              const res = await deleteComponent(slug);
              if (res.ok) { router.refresh(); onConfirmingChange(false); }
              else setErr(res.error);
            } catch (e) {
              setErr(e instanceof Error ? e.message : String(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Deleting…" : "Confirm delete"}
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonSecondary}`}
          disabled={busy}
          onClick={() => onConfirmingChange(false)}
        >
          Cancel
        </button>
      </span>
      {err && <span role="alert" className={styles.buttonError}>{err}</span>}
    </span>
  );
}
