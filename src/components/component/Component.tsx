import React from 'react';
import styles from './Component.module.css';

export interface ComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'mini';
}

export const Component: React.FC<ComponentProps> = ({
  variant,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.container} ${styles[variant]} ${className || ''}`} {...props}>
      <div className={styles.title}>Запчасти</div>
      <div className={styles.content}>
        <div className={styles.text}>
          Широкий ассортимент оригинальных и неоригинальных запчастей
        </div>
      </div>
    </div>
  );
};
