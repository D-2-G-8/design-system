import React from "react";
import styles from "./EwResize.module.css";

export interface EwResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const EwResize = React.forwardRef<HTMLDivElement, EwResizeProps>(
  ({ className, ...props }, ref) => {
    const combinedClassName = className
      ? `${styles.ewResize} ${className}`
      : styles.ewResize;

    return <div ref={ref} className={combinedClassName} {...props} />;
  }
);

EwResize.displayName = "EwResize";
