import React from "react";
import styles from "./N24OutlineOrders.module.scss";

export interface N24OutlineOrdersProps extends React.SVGAttributes<SVGSVGElement> {}

export const N24OutlineOrders: React.FC<N24OutlineOrdersProps> = (props) => {
  return (
    <svg
      className={styles.orders}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9 7H5C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H15C16.1046 21 17 20.1046 17 19V18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 3H19C20.1046 3 21 3.89543 21 5V15C21 16.1046 20.1046 17 19 17H9C7.89543 17 7 16.1046 7 15V5C7 3.89543 7.89543 3 9 3H10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 3C10 2.44772 10.4477 2 11 2H13C13.5523 2 14 2.44772 14 3V4C14 4.55228 13.5523 5 13 5H11C10.4477 5 10 4.55228 10 4V3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
