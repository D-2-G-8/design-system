import React from "react";
import styles from "./Accordion.module.scss";
import { OutlineRegularChevrondown } from "../../icons/outline-regular-chevrondown";
import { OutlineRegularChevronright } from "../../icons/outline-regular-chevronright";
import { OutlineRegularChevronup } from "../../icons/outline-regular-chevronup";

export interface AccordionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Controlled open state; pass together with onOpenChange to drive the accordion from the parent,
   * or omit both to let the component manage its own open/closed state internally.
   */
  open?: boolean;

  /**
   * Initial open state when uncontrolled; ignored if open is provided, defaults to false if omitted.
   */
  defaultOpen?: boolean;

  /**
   * Callback fired when the user toggles the accordion; receives the new open state
   * and should be passed together with open for controlled usage.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Position of the chevron toggle icon; pass 'left' to place it before the title and icon,
   * or 'right' to place it after, defaults to 'right'.
   */
  chevronPosition?: "left" | "right";

  /**
   * Optional icon to display before the title; omit to hide the icon slot.
   */
  icon?: React.ReactNode;

  /**
   * Title text displayed in the accordion header, required and always visible.
   */
  title: string;

  /**
   * Optional description text displayed below the title in a lighter color; omit to hide the description.
   */
  description?: string;

  /**
   * Content revealed when the accordion is opened; can be text, custom components, or any valid React children.
   */
  children?: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  open,
  defaultOpen = false,
  onOpenChange,
  chevronPosition = "right",
  icon,
  title,
  description,
  children,
  className,
  ...rest
}) => {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const effectiveOpen = open ?? openState;

  const handleToggle = () => {
    const nextOpen = !effectiveOpen;
    if (open === undefined) {
      setOpenState(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const chevronButton = (
    <div className={styles.right}>
      <button
        type="button"
        className={styles.chevronContainer}
        onClick={handleToggle}
        aria-expanded={effectiveOpen}
      >
        {chevronPosition === "left" ? (
          effectiveOpen ? (
            <OutlineRegularChevrondown />
          ) : (
            <OutlineRegularChevronright />
          )
        ) : effectiveOpen ? (
          <OutlineRegularChevronup />
        ) : (
          <OutlineRegularChevrondown />
        )}
      </button>
    </div>
  );

  return (
    <div
      className={`${styles.accordion} ${
        effectiveOpen ? styles.opened : styles.closed
      } ${chevronPosition === "left" ? styles.chevronLeft : ""} ${
        className || ""
      }`}
      {...rest}
    >
      <div className={styles.top}>
        {chevronPosition === "left" && chevronButton}
        <div className={styles.left}>
          {icon && <div className={styles.iconSlot}>{icon}</div>}
          <div className={styles.textContainer}>
            <div className={styles.title}>{title}</div>
            {description && (
              <div className={styles.description}>{description}</div>
            )}
          </div>
        </div>
        {chevronPosition === "right" && chevronButton}
      </div>
      {effectiveOpen && (
        <div className={styles.bottom}>
          <div className={styles.content}>{children}</div>
        </div>
      )}
    </div>
  );
};