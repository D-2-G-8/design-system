import React from 'react';
import styles from './SaleSmall.module.css';

export interface SaleSmallProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SaleSmall: React.FC<SaleSmallProps> = ({ className, ...props }) => {
  return (
    <div className={`${styles.container}${className ? ` ${className}` : ''}`} {...props}>
      <div className={styles.saleLabel}>
        <span className={styles.saleText}>SALE</span>
      </div>
    </div>
  );
};
