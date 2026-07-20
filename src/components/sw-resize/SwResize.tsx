import React from "react";
import styles from "./SwResize.module.css";

export interface SwResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SwResize: React.FC<SwResizeProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.swResize}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};
