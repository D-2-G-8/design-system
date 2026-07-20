import React from "react";
import styles from "./NeswResize.module.css";

export interface NeswResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NeswResize = React.forwardRef<HTMLDivElement, NeswResizeProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`${styles.nesWResize}${className ? ` ${className}` : ""}`}
        {...props}
      />
    );
  }
);

NeswResize.displayName = "NeswResize";
