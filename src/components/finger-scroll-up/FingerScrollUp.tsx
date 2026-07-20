import React from 'react';
import styles from './FingerScrollUp.module.css';

export interface FingerScrollUpProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FingerScrollUp: React.FC<FingerScrollUpProps> = ({ className, ...props }) => {
  return (
    <div className={`${styles.fingerScrollUp} ${className || ''}`} {...props}>
      <div className={styles.container}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3L12 15M12 3L8 7M12 3L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 21C8 21 7 21 7 20C7 19 7 16 7 16C7 16 7 14 9 14C9 14 9 12 9 11C9 10 10 9 11 9C11 9 11 7 11 6C11 5 12 4 13 4C14 4 15 5 15 6L15 11C15 11 16 11 17 11C18 11 19 12 19 13L19 18C19 19.6569 17.6569 21 16 21H8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
};
