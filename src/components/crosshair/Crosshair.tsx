import React from 'react';
import styles from './Crosshair.module.css';

export interface CrosshairProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Crosshair: React.FC<CrosshairProps> = ({ className, ...props }) => {
  return (
    <div
      className={`${styles.crosshair}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
