import React from "react";
import styles from "./OutlineRegularChevrondown.module.scss";

export interface OutlineRegularChevrondownProps
  extends React.SVGAttributes<SVGSVGElement> {}

export function OutlineRegularChevrondown({
  ...props
}: OutlineRegularChevrondownProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        className={styles.icon}
        d="M5 8L12 15L19 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
