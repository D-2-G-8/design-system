import React from "react";
import styles from "./VerticalText.module.css";

export interface VerticalTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const VerticalText: React.FC<VerticalTextProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.verticalText}${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
    </div>
  );
};
