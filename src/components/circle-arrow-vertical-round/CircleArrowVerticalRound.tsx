import React from 'react';
import styles from './CircleArrowVerticalRound.module.css';

export interface CircleArrowVerticalRoundProps extends React.SVGAttributes<SVGSVGElement> {}

export function CircleArrowVerticalRound({ className, ...props }: CircleArrowVerticalRoundProps) {
  return (
    <div className={styles.container}>
      <svg
        className={`${styles.icon}${className ? ` ${className}` : ''}`}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 8L12 16M12 8L9 11M12 8L15 11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
