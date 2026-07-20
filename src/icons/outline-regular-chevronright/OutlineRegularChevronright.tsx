import React from "react";
import styles from "./OutlineRegularChevronright.module.scss";

export interface OutlineRegularChevronrightProps
  extends React.SVGAttributes<SVGSVGElement> {}

export function OutlineRegularChevronright({
  ...props
}: OutlineRegularChevronrightProps) {
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
        d="M9 5L16 12L9 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
