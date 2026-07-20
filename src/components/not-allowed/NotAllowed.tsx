import React from "react";
import styles from "./NotAllowed.module.css";

export interface NotAllowedProps extends React.HTMLAttributes<HTMLDivElement> {}

export function NotAllowed({ className, ...props }: NotAllowedProps) {
  return (
    <div
      className={`${styles.notAllowed}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}
