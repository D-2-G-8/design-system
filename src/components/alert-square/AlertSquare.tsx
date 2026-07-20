import React from 'react';
import styles from './AlertSquare.module.css';

export interface AlertSquareProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  message: string;
  icon?: React.ReactNode;
}

export const AlertSquare: React.FC<AlertSquareProps> = ({
  title,
  message,
  icon,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.alert} ${className || ''}`} {...props}>
      {icon && <div className={styles.alertIcon}>{icon}</div>}
      <div className={styles.alertContent}>
        <div className={styles.alertTitle}>{title}</div>
        <div className={styles.alertMessage}>{message}</div>
      </div>
    </div>
  );
};
