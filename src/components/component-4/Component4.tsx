import React from 'react';
import styles from './Component4.module.css';

export interface Component4Props extends React.HTMLAttributes<HTMLDivElement> {}

export function Component4({ className, ...props }: Component4Props) {
  return (
    <div className={`${styles.redpolitika}${className ? ` ${className}` : ''}`} {...props}>
      Редполитика
    </div>
  );
}
