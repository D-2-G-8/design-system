import React from "react";
import styles from "./NwResize.module.css";

export interface NwResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NwResize: React.FC<NwResizeProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.nwResize}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};
