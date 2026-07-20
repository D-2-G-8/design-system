import React from "react";
import styles from "./DamleftnavigationExport.module.css";

export interface DamleftnavigationExportProps
  extends React.HTMLAttributes<HTMLElement> {
  isOpen: boolean;
}

export const DamleftnavigationExport: React.FC<
  DamleftnavigationExportProps
> = ({ isOpen, className, ...props }) => {
  return (
    <nav
      className={`${styles.container} ${
        isOpen ? styles.containerOpen : styles.containerClosed
      } ${className || ""}`}
      {...props}
    >
      <ul className={styles.navList}>
        <li className={`${styles.navItem} ${styles.navItemActive}`}>
          <a href="#" className={styles.navLink}>
            <span className={styles.navIcon}>📁</span>
            <span className={styles.navText}>Assets</span>
          </a>
        </li>
        <li className={styles.navItem}>
          <a href="#" className={styles.navLink}>
            <span className={styles.navIcon}>📊</span>
            <span className={styles.navText}>Collections</span>
          </a>
        </li>
        <li className={styles.navItem}>
          <a href="#" className={styles.navLink}>
            <span className={styles.navIcon}>🔍</span>
            <span className={styles.navText}>Search</span>
          </a>
        </li>
        <div className={styles.divider} />
        <li className={styles.navItem}>
          <a href="#" className={styles.navLink}>
            <span className={styles.navIcon}>⚙️</span>
            <span className={styles.navText}>Settings</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};
