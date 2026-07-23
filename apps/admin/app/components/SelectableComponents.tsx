"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ComponentState } from "@/lib/design-state";
import { generateComponent } from "../actions";
import { StatusBadge } from "./StatusBadge";
import { StaleBadge } from "./StaleBadge";
import { RowActions } from "./RowActions";
import styles from "./dashboard.module.css";

const ROW_CLASS: Record<ComponentState["status"], string> = {
  committed: styles.rowCommitted,
  pending: styles.rowPending,
  never: styles.rowNever,
};

/** Client table body: per-row Generate (existing) + checkbox multi-select with a
 *  "Generate selected (N)" bar. The batch is client-side orchestration over the
 *  existing per-slug `generateComponent` action (bounded concurrency). */
export function SelectableComponents({ state, storybookUrl, activeSlugs }: { state: ComponentState[]; storybookUrl: string | null; activeSlugs: Set<string> }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  // Selectable = never/committed rows WITHOUT an in-flight generate job. A slug
  // with a queued/running job is excluded from the checkbox + "Select all" so the
  // batch "Generate selected" can't stack a duplicate run (same guard as the
  // per-row Generate button).
  const selectable = state.filter((c) => c.status !== "pending" && !activeSlugs.has(c.slug));
  const allSelected = selectable.length > 0 && selectable.every((c) => selected.has(c.slug));

  function toggle(slug: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(selectable.map((c) => c.slug)));
  }

  async function runBatch() {
    setBusy(true);
    // Belt-and-suspenders: drop any slug that became active after it was selected.
    const slugs = [...selected].filter((s) => !activeSlugs.has(s));
    const CONCURRENCY = 3;
    for (let i = 0; i < slugs.length; i += CONCURRENCY) {
      await Promise.all(slugs.slice(i, i + CONCURRENCY).map((s) => generateComponent(s).catch(() => null)));
    }
    setBusy(false);
    setSelected(new Set());
    router.refresh();
  }

  return (
    <>
      {selected.size > 0 && (
        <div className={styles.batchBar}>
          <span>{selected.size} selected</span>
          <button type="button" className={styles.buttonPrimary} disabled={busy} onClick={runBatch}>
            {busy ? "Dispatching…" : `Generate selected (${selected.size})`}
          </button>
        </div>
      )}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col"><input type="checkbox" aria-label="Select all" checked={allSelected} onChange={toggleAll} /></th>
              <th scope="col">Component</th>
              <th scope="col">Kind</th>
              <th scope="col">Status</th>
              <th scope="col">Links</th>
              <th scope="col"><span className={styles.visuallyHidden}>Action</span></th>
            </tr>
          </thead>
          <tbody>
            {state.map((c) => (
              <tr key={c.slug} className={ROW_CLASS[c.status]}>
                <td>
                  {c.status !== "pending" && !activeSlugs.has(c.slug) && (
                    <input type="checkbox" aria-label={`Select ${c.name}`} checked={selected.has(c.slug)} onChange={() => toggle(c.slug)} />
                  )}
                </td>
                <td className={styles.name}>{c.name}</td>
                <td className={styles.kind}>{c.isIcon ? "icon" : "component"}</td>
                <td>
                  <span className={styles.badgeStack}>
                    <StatusBadge status={c.status} />
                    {c.stale && <StaleBadge />}
                  </span>
                </td>
                <td className={styles.links}>
                  <div className={styles.linksInner}>
                    {c.prUrl && <a href={c.prUrl} target="_blank" rel="noreferrer">View PR ↗</a>}
                    {c.status === "pending" && <a href={`/review/${c.slug}`}>Review</a>}
                    {c.status === "committed" && storybookUrl && <a href={storybookUrl} target="_blank" rel="noreferrer">Storybook ↗</a>}
                  </div>
                </td>
                <td className={styles.actionCell}>
                  <RowActions c={c} active={activeSlugs.has(c.slug)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
