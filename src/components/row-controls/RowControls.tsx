import React from 'react';
import styles from './RowControls.module.css';

export interface RowControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  state: 'default' | 'hover' | 'active';
}

export const RowControls: React.FC<RowControlsProps> = ({
  state,
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.rowControls} ${styles[state]} ${className || ''}`}
      {...props}
    />
  );
};
