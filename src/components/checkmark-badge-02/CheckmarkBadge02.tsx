import React from 'react';
import styles from './CheckmarkBadge02.module.css';

export interface CheckmarkBadge02Props extends React.HTMLAttributes<HTMLDivElement> {}

export const CheckmarkBadge02: React.FC<CheckmarkBadge02Props> = ({
  className,
  ...props
}) => {
  return (
    <div className={`${styles.checkmarkBadge}${className ? ` ${className}` : ''}`} {...props}>
      <div className={styles.background} />
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M20 6L9 17L4 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
