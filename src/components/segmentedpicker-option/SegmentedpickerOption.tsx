import React from "react";
import styles from "./SegmentedpickerOption.module.css";

export interface SegmentedpickerOptionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
  icon: boolean;
  darkMode: boolean;
}

export const SegmentedpickerOption: React.FC<SegmentedpickerOptionProps> = ({
  selected,
  icon,
  darkMode,
  children,
  className,
  ...rest
}) => {
  const classNames = [
    styles.option,
    selected && styles.optionSelected,
    icon && styles.optionWithIcon,
    darkMode ? styles.optionDark : styles.optionLight,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} {...rest}>
      {icon && <span className={styles.iconWrapper}>{/* Icon content */}</span>}
      <span className={styles.label}>{children}</span>
    </button>
  );
};
