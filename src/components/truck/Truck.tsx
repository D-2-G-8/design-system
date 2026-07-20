import React from 'react';
import styles from './Truck.module.css';

export interface TruckProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Truck: React.FC<TruckProps> = ({ className, ...props }) => {
  return (
    <div className={`${styles.truck} ${className || ''}`.trim()} {...props}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 3h15v13H1V3z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 8h4l3 3v5h-7V8z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="5.5"
          cy="18.5"
          r="2.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="18.5"
          cy="18.5"
          r="2.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
