import React from 'react';
import styles from './FingerScrollDown.module.css';

export interface FingerScrollDownProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FingerScrollDown: React.FC<FingerScrollDownProps> = ({
  className,
  ...props
}) => {
  return (
    <div className={`${styles.container} ${className || ''}`} {...props}>
      <div className={styles.animationWrapper}>
        <div className={styles.fingerIcon}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C11.4477 2 11 2.44772 11 3V10C11 10.5523 11.4477 11 12 11C12.5523 11 13 10.5523 13 10V3C13 2.44772 12.5523 2 12 2Z"
              fill="currentColor"
            />
            <path
              d="M8 8C7.44772 8 7 8.44772 7 9V15C7 15.5523 7.44772 16 8 16H9V21C9 21.5523 9.44772 22 10 22C10.5523 22 11 21.5523 11 21V15V11C11 10.4477 10.5523 10 10 10H8C7.44772 10 7 10.4477 7 11V9C7 8.44772 7.44772 8 8 8Z"
              fill="currentColor"
            />
            <path
              d="M16 8C16.5523 8 17 8.44772 17 9V11C17 10.4477 16.5523 10 16 10H14C13.4477 10 13 10.4477 13 11V15V21C13 21.5523 13.4477 22 14 22C14.5523 22 15 21.5523 15 21V16H16C16.5523 16 17 15.5523 17 15V9C17 8.44772 16.5523 8 16 8Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className={styles.scrollText}>Scroll Down</div>
      </div>
    </div>
  );
};
