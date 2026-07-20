import React from "react";
import styles from "./Frame427321383.module.css";

export interface Frame427321383Props
  extends React.HTMLAttributes<HTMLDivElement> {}

export const Frame427321383: React.FC<Frame427321383Props> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.container}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};
