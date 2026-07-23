"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { acceptSyncPr, closeSyncPr } from "../../actions";
import styles from "../review.module.css";

/** Accept (gated merge) or close the sync PR. Server re-checks the gate; the
 *  `disabled` prop is only an advisory hint from the server render. Both
 *  handlers wrap their action call in try/catch (mirroring MergeButton):
 *  an unhandled throw from a server action gets redacted to an opaque
 *  production "digest" message, so any thrown error is caught here and its
 *  real message surfaced instead. */
export function SyncActions({ acceptDisabled, disabledReason }: { acceptDisabled: boolean; disabledReason: string }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  // While Accept is gated (CI still running / not yet green), re-fetch the
  // server-rendered gate every 7s so the button enables itself once CI passes,
  // without a manual reload. Stops as soon as it's enabled.
  useEffect(() => {
    if (!acceptDisabled) return;
    const t = setInterval(() => router.refresh(), 7000);
    return () => clearInterval(t);
  }, [acceptDisabled, router]);

  return (
    <div className={styles.mergeCard}>
      <button
        type="button"
        className={styles.mergeBtn}
        disabled={busy || acceptDisabled}
        title={acceptDisabled ? disabledReason : undefined}
        onClick={async () => {
          setBusy(true);
          setMsg(null);
          try {
            const res = await acceptSyncPr();
            if (res.merged) router.push("/");
            else setMsg(res.reason ?? "accept failed");
          } catch (e) {
            setMsg(e instanceof Error ? e.message : String(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Working…" : "Accept catalog into master"}
      </button>
      <button
        type="button"
        className={styles.secondaryButton}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setMsg(null);
          try {
            const res = await closeSyncPr();
            if (res.closed) router.push("/");
            else setMsg(res.reason ?? "close failed");
          } catch (e) {
            setMsg(e instanceof Error ? e.message : String(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        Close without merging
      </button>
      {(msg || acceptDisabled) && (
        <p role="alert" className={styles.mergeStatusText}>
          {msg ?? disabledReason}
        </p>
      )}
    </div>
  );
}
