import React from "react";
import styles from "./Stlleftnavigationparent.module.css";

export interface StlleftnavigationparentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
}

export const Stlleftnavigationparent: React.FC<StlleftnavigationparentProps> = ({
  isOpen,
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.container} ${isOpen ? styles.containerOpen : styles.containerClose} ${className || ""}`}
      {...props}
    >
      <div className={styles.header}>
        <div className={styles.title}></div>
        <div className={`${styles.icon} ${isOpen ? styles.iconOpen : styles.iconClose}`}></div>
      </div>
      <div className={`${styles.content} ${isOpen ? styles.contentOpen : styles.contentClose}`}>
        {children}
      </div>
    </div>
  );
};
