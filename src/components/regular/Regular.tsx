import React from 'react';
import styles from './Regular.module.css';

export interface RegularProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Regular: React.FC<RegularProps> = ({ className, ...props }) => {
  return (
    <div className={`${styles.regular}${className ? ` ${className}` : ''}`} {...props} />
  );
};
