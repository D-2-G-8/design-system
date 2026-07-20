import React from 'react';
import styles from './ArrowLeft02Round.module.css';

export interface ArrowLeft02RoundProps extends React.SVGAttributes<SVGSVGElement> {}

export function ArrowLeft02Round({ className, ...props }: ArrowLeft02RoundProps) {
  return (
    <svg
      className={`${styles.arrowLeftRound} ${styles.icon} ${className || ''}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 16L8 12L12 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 12H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
