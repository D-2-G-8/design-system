import React from 'react';
import styles from './N24OutlineOrders.module.scss';

export interface N24OutlineOrdersProps extends React.SVGAttributes<SVGSVGElement> {}

export const N24OutlineOrders: React.FC<N24OutlineOrdersProps> = (props) => {
  return (
    <svg
      className={styles.icon}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M9 7H5C4.44772 7 4 7.44772 4 8V9C4 9.55228 4.44772 10 5 10H9C9.55228 10 10 9.55228 10 9V8C10 7.44772 9.55228 7 9 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 7H5C4.44772 7 4 7.44772 4 8V18C4 18.5523 4.44772 19 5 19H19C19.5523 19 20 18.5523 20 18V8C20 7.44772 19.5523 7 19 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 4V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 4V7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 13H20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
