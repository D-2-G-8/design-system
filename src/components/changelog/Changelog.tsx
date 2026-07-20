import React from "react";
import styles from "./Changelog.module.css";

export interface ChangelogProps extends React.HTMLAttributes<HTMLDivElement> {
  entries: Array<{
    date: string;
    category?: string;
    description: string;
    items?: string[];
  }>;
  title?: string;
}

export const Changelog: React.FC<ChangelogProps> = ({
  entries,
  title = "Changelog",
  className,
  ...props
}) => {
  return (
    <div className={`${styles.changelog} ${className || ""}`} {...props}>
      <div className={styles.changelogHeader}>
        <h2 className={styles.changelogTitle}>{title}</h2>
      </div>
      <ul className={styles.changelogList}>
        {entries.map((entry, index) => (
          <li key={index} className={styles.changelogItem}>
            <div className={styles.changelogEntry}>
              <div className={styles.changelogDate}>{entry.date}</div>
              {entry.category && (
                <div className={styles.changelogCategory}>{entry.category}</div>
              )}
              <div className={styles.changelogContent}>
                <div className={styles.changelogDescription}>
                  {entry.description}
                </div>
                {entry.items && entry.items.length > 0 && (
                  <ul>
                    {entry.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
