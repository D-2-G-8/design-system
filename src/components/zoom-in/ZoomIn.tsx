import React from 'react';
import styles from './ZoomIn.module.css';

export interface ZoomInProps extends React.SVGAttributes<SVGSVGElement> {}

export const ZoomIn: React.FC<ZoomInProps> = ({ className, ...props }) => {
  return (
    <svg
      className={`${styles.zoomIn}${className ? ` ${className}` : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        className={styles.icon}
        cx="11"
        cy="11"
        r="8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={styles.icon}
        d="M21 21L16.65 16.65"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={styles.icon}
        d="M11 8V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={styles.icon}
        d="M8 11H14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
