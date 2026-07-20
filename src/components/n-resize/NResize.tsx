import React from "react";
import styles from "./NResize.module.css";

export interface NResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NResize = React.forwardRef<HTMLDivElement, NResizeProps>(
  ({ className, ...props }, ref) => {
    const classNames = [styles.nResize, className].filter(Boolean).join(" ");

    return <div ref={ref} className={classNames} {...props} />;
  }
);

NResize.displayName = "NResize";
