import React from "react";
import styles from "./WResize.module.css";

export interface WResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const WResize: React.FC<WResizeProps> = ({ className, ...props }) => {
  return (
    <div
      className={`${styles.wResize}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};
