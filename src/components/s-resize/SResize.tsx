import React from "react";
import styles from "./SResize.module.css";

export interface SResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SResize: React.FC<SResizeProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.sResize}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};
