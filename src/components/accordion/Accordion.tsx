import React from "react";
import styles from "./Accordion.module.scss";
import { N24OutlineOrders } from "../../icons/24-outline-orders";

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  opened: boolean;
  chevronPosition: "left" | "right";
  icon?: boolean;
  title?: string;
  desc?: boolean;
  descValue?: string;
  text?: boolean;
  textValue?: string;
  swapContent?: boolean;
  contentValue?: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  opened,
  chevronPosition,
  icon = true,
  title = "",
  desc = false,
  descValue = "",
  text = true,
  textValue = "Lorem ipsum dolor sit amet, consectetur ",
  swapContent = true,
  contentValue,
  className,
  ...props
}) => {
  const chevronClasses = [
    styles.chevronContainer,
    chevronPosition === "left" ? styles.chevronLeft : styles.chevronRight,
    opened ? styles.opened : styles.closed,
  ]
    .filter(Boolean)
    .join(" ");

  const accordionClasses = [
    styles.accordion,
    opened ? styles.opened : styles.closed,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={accordionClasses} {...props}>
      <div className={styles.top}>
        {chevronPosition === "left" && (
          <div className={styles.right}>
            <div className={chevronClasses}></div>
          </div>
        )}
        <div className={styles.left}>
          {icon && <N24OutlineOrders />}
          <div className={styles.text}>
            {title && <span>{title}</span>}
            {desc && descValue && <span>{descValue}</span>}
          </div>
        </div>
        {chevronPosition === "right" && (
          <div className={styles.right}>
            <div className={chevronClasses}></div>
          </div>
        )}
      </div>
      {opened && (
        <div className={styles.bottom}>
          {text && textValue && <div className={styles.contentText}>{textValue}</div>}
          {swapContent && contentValue && (
            <div className={styles.swapContent}>{contentValue}</div>
          )}
        </div>
      )}
    </div>
  );
};
