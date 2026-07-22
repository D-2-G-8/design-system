import type { ComponentState } from "@/lib/design-state";
import { StatusBadge } from "./StatusBadge";
import { GenerateButton } from "./GenerateButton";
import styles from "./dashboard.module.css";

const ROW_CLASS: Record<ComponentState["status"], string> = {
  committed: styles.rowCommitted,
  pending: styles.rowPending,
  never: styles.rowNever,
};

/** Component status table: name, kind, status, PR/Storybook links, and the
 *  generate/regenerate action. Server component -- `state` is already
 *  resolved by the caller (`loadComponentState()`), no state read here. */
export function ComponentTable({
  state,
  storybookUrl,
}: {
  state: ComponentState[];
  storybookUrl: string | null;
}) {
  return (
    <section className={styles.section} aria-labelledby="components-heading">
      <h2 id="components-heading" className={styles.sectionHeading}>
        Components
        <span className={styles.sectionCount}>{state.length}</span>
      </h2>
      {state.length === 0 ? (
        <p className={styles.empty}>No components found in the manifest.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Component</th>
                <th scope="col">Kind</th>
                <th scope="col">Status</th>
                <th scope="col">Links</th>
                <th scope="col">
                  <span className={styles.visuallyHidden}>Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {state.map((c) => (
                <tr key={c.slug} className={ROW_CLASS[c.status]}>
                  <td className={styles.name}>{c.name}</td>
                  <td className={styles.kind}>{c.isIcon ? "icon" : "component"}</td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className={styles.links}>
                    {c.prUrl && (
                      <a href={c.prUrl} target="_blank" rel="noreferrer">
                        View PR ↗
                      </a>
                    )}
                    {c.status === "pending" && <a href={`/review/${c.slug}`}>Review</a>}
                    {c.status === "committed" && storybookUrl && (
                      <a href={storybookUrl} target="_blank" rel="noreferrer">
                        Storybook ↗
                      </a>
                    )}
                  </td>
                  <td className={styles.actionCell}>
                    <GenerateButton slug={c.slug} label={c.status === "never" ? "Generate" : "Regenerate"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
