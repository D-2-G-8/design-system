import React from 'react';
import styles from './CheckmarkSquare01.module.css';

export interface CheckmarkSquare01Props extends React.SVGAttributes<SVGSVGElement> {}

export function CheckmarkSquare01({ className, ...props }: CheckmarkSquare01Props) {
  return (
    <div className={styles.container}>
      <svg
        className={`${styles.icon} ${className || ''}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          className={styles.checkmark}
          d="M8 12L11 15L16 9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
