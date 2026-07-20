import React from 'react';
import styles from './HomeIndicator.module.css';

export interface HomeIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  device: 'iPhone';
  orientation: 'portrait';
}

export const HomeIndicator: React.FC<HomeIndicatorProps> = ({
  device,
  orientation,
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.homeIndicator} ${styles[device]} ${styles[orientation]} ${className || ''}`.trim()}
      {...props}
    />
  );
};
