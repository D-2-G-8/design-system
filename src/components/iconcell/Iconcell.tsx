import React from 'react';
import styles from './Iconcell.module.css';

export interface IconcellProps extends React.HTMLAttributes<HTMLDivElement> {
  appearance: 'off' | 'on';
}

export function Iconcell({ appearance, className, children, ...props }: IconcellProps) {
  const appearanceClass = appearance === 'on' ? styles.iconCellOn : styles.iconCellOff;
  
  return (
    <div 
      className={`${styles.iconCell} ${appearanceClass} ${className || ''}`.trim()}
      {...props}
    >
      <div className={styles.icon}>
        {children}
      </div>
    </div>
  );
}
