import React from 'react';
import styles from './ChevronDown.module.css';

export interface ChevronDownProps extends React.SVGAttributes<SVGSVGElement> {}

export const ChevronDown: React.FC<ChevronDownProps> = ({ className, ...props }) => {
  return (
    <svg
      className={`${styles.chevronDown}${className ? ` ${className}` : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
