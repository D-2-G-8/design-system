import React from "react";
import styles from "./NsResize.module.css";

export interface NsResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NsResize = React.forwardRef<HTMLDivElement, NsResizeProps>(
  ({ className, ...props }, ref) => {
    const combinedClassName = className
      ? `${styles.nsResize} ${className}`
      : styles.nsResize;

    return <div ref={ref} className={combinedClassName} {...props} />;
  }
);

NsResize.displayName = "NsResize";
