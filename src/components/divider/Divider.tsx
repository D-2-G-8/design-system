import React from 'react';
import styles from './Divider.module.css';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  size: 's' | 'm';
}

export const Divider: React.FC<DividerProps> = ({ size, className, ...props }) => {
  const sizeClass = size === 's' ? styles.sizeS : styles.sizeM;
  
  return (
    <hr
      className={`${styles.divider} ${sizeClass} ${className || ''}`.trim()}
      {...props}
    />
  );
};
