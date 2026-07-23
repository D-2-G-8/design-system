import { groupTokensByCategory, type TokenEntry } from "@/lib/tokens-view";
import styles from "./dashboard.module.css";

/** Read-only dashboard section listing the design tokens (from tokens.json on
 *  master), grouped by category with a color swatch for color tokens. */
export function TokensPanel({ tokens }: { tokens: Record<string, TokenEntry> }) {
  const groups = groupTokensByCategory(tokens);
  const total = Object.keys(tokens).length;
  return (
    <section className={styles.section} aria-labelledby="tokens-heading">
      <h2 id="tokens-heading" className={styles.sectionHeading}>
        Tokens
        <span className={styles.sectionCount}>{total}</span>
      </h2>
      {total === 0 ? (
        <p className={styles.empty}>No tokens yet. Run “Sync from Figma” to import them.</p>
      ) : (
        groups.map((g) => (
          <div key={g.category} className={styles.tokenGroup}>
            <h3 className={styles.tokenCategory}>{g.category}</h3>
            <div className={styles.tokenGrid}>
              {g.tokens.map((t) => (
                <div key={t.name} className={styles.tokenItem}>
                  {g.category === "color" && (
                    <span className={styles.tokenSwatch} style={{ background: t.value }} aria-hidden="true" />
                  )}
                  <span className={styles.tokenName}>{t.name}</span>
                  <span className={styles.tokenValue}>{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
