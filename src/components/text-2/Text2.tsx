import React from "react";
import styles from "./Text2.module.css";

export interface Text2Props extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Text2: React.FC<Text2Props> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.textWrapper} ${className || ""}`.trim()} {...props}>
      <div className={styles.text}>{children}</div>
    </div>
  );
};
