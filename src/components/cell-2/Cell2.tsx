import React from 'react';
import styles from './Cell2.module.css';

export interface Cell2Props extends React.HTMLAttributes<HTMLDivElement> {}

export const Cell2: React.FC<Cell2Props> = ({ className, ...props }) => {
  return (
    <div 
      className={`${styles.cell}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
