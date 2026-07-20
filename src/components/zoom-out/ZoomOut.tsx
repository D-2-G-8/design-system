import React from 'react';
import styles from './ZoomOut.module.css';

export interface ZoomOutProps extends React.SVGAttributes<SVGSVGElement> {}

export const ZoomOut: React.FC<ZoomOutProps> = ({ className, ...props }) => {
  return (
    <svg
      className={`${styles.zoomOut} ${className || ''}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle className={styles.icon} cx="11" cy="11" r="8" />
      <line className={styles.icon} x1="21" y1="21" x2="16.65" y2="16.65" />
      <line className={styles.icon} x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
};
