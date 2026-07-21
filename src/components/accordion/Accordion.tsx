import React from "react";
import { N24OutlineOrders } from "../../icons/24-outline-orders";
import styles from "./Accordion.module.scss";

export interface AccordionProps {
  opened: boolean;
  chevronPosition: "left" | "right";
  icon?: React.ReactNode;
  title: string;
  description?: string;
  content?: React.ReactNode;
  onToggle: () => void;
}

export const Accordion: React.FC<AccordionProps> = ({
  opened,
  chevronPosition,
  icon,
  title,
  description,
  content,
  onToggle,
}) => {
  const chevronSvg = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const chevronElement = (
    <div className={styles.right}>
      <div className={styles.chevronContainer}>{chevronSvg}</div>
    </div>
  );

  const leftContent = (
    <div className={styles.left}>
      {icon !== undefined ? (
        <div className={styles.iconWrapper}>{icon}</div>
      ) : (
        <N24OutlineOrders />
      )}
      <div className={styles.textContainer}>
        {title && <div className={styles.titleText}>{title}</div>}
        {description && (
          <div className={styles.descriptionText}>{description}</div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`${styles.accordion} ${opened ? styles.opened : styles.closed} ${
        chevronPosition === "left" ? styles.chevronLeft : styles.chevronRight
      }`}
    >
      <div className={styles.top} onClick={onToggle}>
        {chevronPosition === "left" ? (
          <>
            {chevronElement}
            {leftContent}
          </>
        ) : (
          <>
            {leftContent}
            {chevronElement}
          </>
        )}
      </div>
      {opened && (
        <div className={styles.bottom}>
          {content && <div className={styles.swappableContent}>{content}</div>}
        </div>
      )}
    </div>
  );
};
