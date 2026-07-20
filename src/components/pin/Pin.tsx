import React from "react";
import styles from "./Pin.module.css";

export interface PinProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Pin: React.FC<PinProps> = ({ className, ...props }) => {
  return (
    <div
      className={`${styles.pin}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};
