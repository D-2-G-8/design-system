import React from 'react';
import styles from './Sizing.module.css';

export interface SizingProps extends React.HTMLAttributes<HTMLDivElement> {
  size: 'm' | 'l';
}

export const Sizing: React.FC<SizingProps> = ({ size, className, ...props }) => {
  const sizeClass = size === 'm' ? styles.sizeM : styles.sizeL;
  
  return (
    <div
      className={`${styles.sizing} ${sizeClass} ${className || ''}`.trim()}
      {...props}
    />
  );
};
