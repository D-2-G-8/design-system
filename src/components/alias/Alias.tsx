import React from 'react';
import styles from './Alias.module.css';

export interface AliasProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Alias: React.FC<AliasProps> = ({ className, ...props }) => {
  return (
    <div
      className={`${styles.alias}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
