"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { mergeComponentPr } from "../actions";
import styles from "./review.module.css";

/** The review page's one mutating control. Three states in sequence -- trigger,
 *  confirm, done -- each visually more committed than the last (quiet outline ->
 *  solid green -> checkmark), so the weight of the button tracks the weight of
 *  the action. Disabled state never reads as broken: it's the same muted
 *  "pending" language the rest of the admin uses for "not ready yet," carrying
 *  the server's own reason rather than inventing one. */
export function MergeButton({
  slug,
  prNumber,
  disabled,
  reason,
}: {
  slug: string;
  prNumber: number;
  disabled: boolean;
  reason: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [merged, setMerged] = useState(false);
  const router = useRouter();
  const reasonId = useId();

  if (merged) {
    return <span className={styles.mergedOk}>Merged ✓</span>;
  }

  if (!confirming) {
    return (
      <span className={styles.mergeWrap}>
        <button
          type="button"
          className={styles.mergeBtn}
          disabled={disabled}
          aria-describedby={disabled && reason ? reasonId : undefined}
          onClick={() => setConfirming(true)}
        >
          Merge #{prNumber}
        </button>
        {disabled && reason && (
          <span id={reasonId} className={styles.mergeReason}>
            Not yet: {reason}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={styles.mergeWrap}>
      <span className={styles.mergeConfirmPrompt}>Merge #{prNumber} to master?</span>
      <button
        type="button"
        className={styles.mergeConfirm}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setErr(null);
          try {
            const res = await mergeComponentPr(slug);
            if (res.merged) {
              setMerged(true);
              router.refresh();
            } else {
              setErr(res.reason ?? "merge failed");
            }
          } catch (e) {
            setErr(e instanceof Error ? e.message : String(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Merging…" : "Confirm merge"}
      </button>
      <button
        type="button"
        className={styles.mergeCancel}
        disabled={busy}
        onClick={() => setConfirming(false)}
      >
        Cancel
      </button>
      {err && (
        <span role="alert" className={styles.mergeError}>
          {err}
        </span>
      )}
    </span>
  );
}
