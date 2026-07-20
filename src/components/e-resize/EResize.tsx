import React from "react";
import styles from "./EResize.module.css";

export interface EResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const EResize: React.FC<EResizeProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.eResize}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};
