import React from 'react';
import styles from './CrossSmall.module.css';

export interface CrossSmallProps extends React.SVGAttributes<SVGSVGElement> {}

export const CrossSmall: React.FC<CrossSmallProps> = ({ className, ...props }) => {
  return (
    <svg
      className={`${styles.crossSmall}${className ? ` ${className}` : ''}`}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 4L4 12M4 4L12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
