import type { ComponentState } from "@/lib/design-state";
import { SelectableComponents } from "./SelectableComponents";
import styles from "./dashboard.module.css";

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
        <SelectableComponents state={state} storybookUrl={storybookUrl} />
      )}
    </section>
  );
}
