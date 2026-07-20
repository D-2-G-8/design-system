import React from "react";
import styles from "./NeResize.module.css";

export interface NeResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NeResize = React.forwardRef<HTMLDivElement, NeResizeProps>(
  ({ className, ...props }, ref) => {
    const classNames = [styles.neResize, className].filter(Boolean).join(" ");

    return <div ref={ref} className={classNames} {...props} />;
  }
);

NeResize.displayName = "NeResize";
