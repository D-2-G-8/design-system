import React from 'react';
import styles from './AdviEs.module.css';

export interface AdviEsProps extends React.HTMLAttributes<HTMLDivElement> {}

export const AdviEs: React.FC<AdviEsProps> = ({ className, children, ...props }) => {
  return (
    <div className={`${styles.container} ${className || ''}`.trim()} {...props}>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};
