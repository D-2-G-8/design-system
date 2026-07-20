import React from 'react';
import styles from './Default.module.css';

export interface DefaultProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Default: React.FC<DefaultProps> = ({ className, ...props }) => {
  return (
    <div className={`${styles.container}${className ? ` ${className}` : ''}`} {...props} />
  );
};
