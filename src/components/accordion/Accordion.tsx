import React from "react";
import styles from "./Accordion.module.scss";
import { N24OutlineOrders } from "../../icons/24-outline-orders";
import { OutlineRegularChevrondown } from "../../icons/outline-regular-chevrondown";
import { OutlineRegularChevronright } from "../../icons/outline-regular-chevronright";
import { OutlineRegularChevronup } from "../../icons/outline-regular-chevronup";

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  chevronPosition?: "left" | "right";
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  open,
  defaultOpen = false,
  onOpenChange,
  chevronPosition = "right",
  title,
  description,
  icon,
  children,
  className,
  ...rest
}) => {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const isOpen = open ?? openState;

  const handleToggle = () => {
    const nextOpen = !isOpen;
    if (open === undefined) {
      setOpenState(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const chevronIcon = () => {
    if (chevronPosition === "left") {
      return isOpen ? (
        <OutlineRegularChevrondown />
      ) : (
        <OutlineRegularChevronright />
      );
    } else {
      return isOpen ? <OutlineRegularChevronup /> : <OutlineRegularChevrondown />;
    }
  };

  const leftContent = (
    <div className={styles.left}>
      {icon !== undefined && <div className={styles.iconWrapper}>{icon}</div>}
      <div className={styles.textContainer}>
        <div className={styles.title}>{title}</div>
        {description && <div className={styles.description}>{description}</div>}
      </div>
    </div>
  );

  const rightContent = (
    <div className={styles.right}>
      <div className={styles.chevronContainer} onClick={handleToggle}>
        <div className={styles.chevronIcon}>{chevronIcon()}</div>
      </div>
    </div>
  );

  return (
    <div
      className={`${styles.accordion} ${
        chevronPosition === "left" ? styles.chevronLeft : styles.chevronRight
      } ${isOpen ? styles.opened : styles.closed} ${className || ""}`}
      {...rest}
    >
      <div className={styles.top}>
        {chevronPosition === "left" ? (
          <>
            {rightContent}
            {leftContent}
          </>
        ) : (
          <>
            {leftContent}
            {rightContent}
          </>
        )}
      </div>
      {isOpen && children && (
        <div className={styles.bottom}>
          <div className={styles.content}>{children}</div>
        </div>
      )}
    </div>
  );
};
