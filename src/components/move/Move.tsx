import React from "react";
import styles from "./Move.module.css";

export interface MoveProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Move: React.FC<MoveProps> = ({ className, ...props }) => {
  return (
    <div
      className={`${styles.move}${className ? ` ${className}` : ""}`}
      {...props}
    />
  );
};
