import React from 'react';
import styles from './AllCursors.module.css';

export interface AllCursorsProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AllCursors: React.FC<AllCursorsProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.allCursors}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
