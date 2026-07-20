import type { HTMLAttributes } from "react";
import styles from "./Sale.module.css";

export interface SaleProps extends HTMLAttributes<HTMLDivElement> {}

export function Sale({ className, ...props }: SaleProps) {
  return (
    <div
      className={`${styles.sale}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
}
