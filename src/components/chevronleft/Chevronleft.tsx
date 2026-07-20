import React from 'react';
import styles from './Chevronleft.module.css';

export interface ChevronleftProps extends React.SVGAttributes<SVGSVGElement> {
  type?: 'basic';
}

export const Chevronleft: React.FC<ChevronleftProps> = ({
  type = 'basic',
  className,
  ...props
}) => {
  return (
    <svg
      className={`${styles.chevronLeft} ${styles.icon} ${styles[type]} ${className || ''}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
