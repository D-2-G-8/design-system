import React from "react";
import styles from "./Order.module.css";

export interface OrderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Order: React.FC<OrderProps> = ({ className, ...props }) => {
  return (
    <div
      className={`${styles.order}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};
