import React from 'react';
import styles from './Grab.module.css';

export interface GrabProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Grab: React.FC<GrabProps> = ({ className, ...props }) => {
  return (
    <div
      className={`${styles.grab}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
