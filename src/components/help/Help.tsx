import React from 'react';
import styles from './Help.module.css';

export interface HelpProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Help: React.FC<HelpProps> = ({ className, ...props }) => {
  return (
    <div
      className={`${styles.help}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
