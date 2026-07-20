import React from 'react';
import styles from './Pointer.module.css';

export interface PointerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Pointer: React.FC<PointerProps> = ({ className, ...props }) => {
  return (
    <div
      className={`${styles.pointer}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
