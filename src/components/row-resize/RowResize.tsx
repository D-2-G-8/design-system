import React from "react";
import styles from "./RowResize.module.css";

export interface RowResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const RowResize: React.FC<RowResizeProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.rowResize}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};
