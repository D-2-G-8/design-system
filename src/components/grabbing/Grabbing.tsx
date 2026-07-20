import React from 'react';
import styles from './Grabbing.module.css';

export interface GrabbingProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Grabbing: React.FC<GrabbingProps> = ({ className, ...props }) => {
  return (
    <div
      className={`${styles.grabbing}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
