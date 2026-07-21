import React from "react";
import styles from "./Accordion.module.scss";
import { N24OutlineOrders } from "../24-outline-orders";

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
  const chevronIcon = (
    <div className={styles.chevronContainer}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transform: opened ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }}
      >
        <path
          d="M6 9L12 15L18 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  return (
    <div
      className={`${styles.accordion} ${opened ? styles.opened : styles.closed} ${
        chevronPosition === "left" ? styles.chevronLeft : styles.chevronRight
      }`}
    >
      <div className={styles.top} onClick={onToggle}>
        {chevronPosition === "left" && (
          <div className={styles.right}>{chevronIcon}</div>
        )}
        <div className={styles.left}>
          {icon !== undefined && (
            <div className={styles.iconWrapper}>
              {icon || <N24OutlineOrders />}
            </div>
          )}
          <div className={styles.textContainer}>
            {title && <div className={styles.title}>{title}</div>}
            {description && (
              <div className={styles.description}>{description}</div>
            )}
          </div>
        </div>
        {chevronPosition === "right" && (
          <div className={styles.right}>{chevronIcon}</div>
        )}
      </div>
      {opened && (
        <div className={styles.bottom}>
          {typeof content === "string" ? (
            <div className={styles.contentText}>{content}</div>
          ) : (
            <div className={styles.swapContent}>{content}</div>
          )}
        </div>
      )}
    </div>
  );
};
