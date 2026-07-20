import React from 'react';
import styles from './Component2.module.css';

export interface Component2Props extends React.HTMLAttributes<HTMLDivElement> {
  property1: 'мини';
}

export const Component2: React.FC<Component2Props> = ({
  property1,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.container} ${styles.mini} ${className || ''}`} {...props}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <div className={styles.icon} />
          <div className={styles.title}>Магазины</div>
        </div>
        <div className={styles.content}>
          <div className={styles.subtitle} />
        </div>
      </div>
    </div>
  );
};
