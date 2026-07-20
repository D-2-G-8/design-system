import React from "react";
import styles from "./NoDrop.module.css";

export interface NoDropProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NoDrop: React.FC<NoDropProps> = ({ className, ...props }) => {
  return (
    <div
      className={`${styles.noDrop}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};
