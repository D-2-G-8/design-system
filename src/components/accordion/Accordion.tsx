import React from "react";
import styles from "./Accordion.module.scss";
import { N24OutlineOrders } from "../../icons/24-outline-orders";

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  opened: boolean;
  chevronPosition: "left" | "right";
  icon?: React.ReactNode;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  opened,
  chevronPosition,
  icon,
  title,
  description,
  children,
  className,
  ...props
}) => {
  const chevronIcon = (
    <div className={styles.right}>
      <div className={styles.chevronContainer}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            transform: opened ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s"
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
    </div>
  );

  return (
    <div
      className={`${styles.accordion} ${opened ? styles.opened : ""} ${
        chevronPosition === "left" ? styles.chevronLeft : styles.chevronRight
      } ${className || ""}`}
      {...props}
    >
      <div className={styles.top}>
        {chevronPosition === "left" && chevronIcon}
        <div className={styles.left}>
          {icon !== undefined ? icon : <N24OutlineOrders />}
          <div className={styles.text}>
            <div className={styles.title}>{title}</div>
            {description && <div className={styles.desc}>{description}</div>}
          </div>
        </div>
        {chevronPosition === "right" && chevronIcon}
      </div>
      {opened && (
        <div className={styles.bottom}>
          <div className={styles.content}>{children}</div>
        </div>
      )}
    </div>
  );
};
