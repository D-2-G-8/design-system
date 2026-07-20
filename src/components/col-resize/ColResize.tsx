import React from "react";
import styles from "./ColResize.module.css";

export interface ColResizeProps extends React.HTMLAttributes<HTMLDivElement> {
  hover: boolean;
}

export const ColResize: React.FC<ColResizeProps> = ({
  hover,
  className,
  ...props
}) => {
  const classes = [
    styles.colResize,
    hover && styles.colResizeHover,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={classes} {...props} />;
};
