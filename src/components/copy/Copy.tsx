import React from "react";
import styles from "./Copy.module.css";

export interface CopyProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Copy: React.FC<CopyProps> = ({ className, ...props }) => {
  return <div className={`${styles.copy} ${className || ""}`.trim()} {...props} />;
};
