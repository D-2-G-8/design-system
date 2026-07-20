import React from 'react';
import styles from './AndroidStatusBar.module.css';

export interface AndroidStatusBarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({
  className,
  ...props
}) => {
  return (
    <div className={`${styles.statusBar}${className ? ` ${className}` : ''}`} {...props}>
      <span className={styles.timeText}>9:41</span>
      <div className={styles.iconGroup}>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.5 1.5c-1.97 0-3.63 1.4-3.95 3.25C6.54 5.31 5 7.19 5 9.5c0 2.76 2.24 5 5 5s5-2.24 5-5c0-2.31-1.54-4.19-3.55-4.75C11.13 2.9 11.75 1.5 12.5 1.5zm0 11c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5z" />
        </svg>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z" />
        </svg>
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
        </svg>
      </div>
    </div>
  );
};
