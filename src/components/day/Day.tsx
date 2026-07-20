import React from 'react';
import styles from './Day.module.css';

export interface DayProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const Day: React.FC<DayProps> = ({ children, className, ...props }) => {
  return (
    <div className={`${styles.day}${className ? ` ${className}` : ''}`} {...props}>
      <div className={styles.dayContent}>
        <div className={styles.dayText}>{children}</div>
      </div>
    </div>
  );
};
