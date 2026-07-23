import styles from "./dashboard.module.css";

/** Overlay badge for a committed component whose Figma design changed since it
 *  was generated -- a nudge to regenerate. Renders next to StatusBadge. */
export function StaleBadge() {
  return (
    <span className={`${styles.badge} ${styles.statusStale}`} title="Figma design changed since this was generated">
      <span className={styles.badgeDot} aria-hidden="true" />
      Figma changed
    </span>
  );
}
