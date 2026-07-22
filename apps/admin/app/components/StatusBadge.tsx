import type { ComponentState } from "@/lib/design-state";
import styles from "./dashboard.module.css";

const LABEL: Record<ComponentState["status"], string> = {
  committed: "Committed",
  pending: "Pending",
  never: "Never generated",
};

const STATUS_CLASS: Record<ComponentState["status"], string> = {
  committed: styles.statusCommitted,
  pending: styles.statusPending,
  never: styles.statusNever,
};

/** Colored dot + label for a component's git-derived generation status. */
export function StatusBadge({ status }: { status: ComponentState["status"] }) {
  return (
    <span className={`${styles.badge} ${STATUS_CLASS[status]}`}>
      <span className={styles.badgeDot} aria-hidden="true" />
      {LABEL[status]}
    </span>
  );
}
