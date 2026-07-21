import React from "react";
import styles from "./N24OutlineOrders.module.scss";

export interface N24OutlineOrdersProps extends React.SVGAttributes<SVGSVGElement> {}

export function N24OutlineOrders({ ...props }: N24OutlineOrdersProps) {
  return (
    <svg
      className={styles.root}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9 7H5C4.44772 7 4 7.44772 4 8V10C4 10.5523 4.44772 11 5 11H9C9.55228 11 10 10.5523 10 10V8C10 7.44772 9.55228 7 9 7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 13H5C4.44772 13 4 13.4477 4 14V16C4 16.5523 4.44772 17 5 17H9C9.55228 17 10 16.5523 10 16V14C10 13.4477 9.55228 13 9 13Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 8.5H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 15H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
