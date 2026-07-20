import React from 'react';
import styles from './Tab40.module.css';

export interface Tab40Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type: 'text32';
  isActive: boolean;
  children?: React.ReactNode;
}

export const Tab40: React.FC<Tab40Props> = ({
  type,
  isActive,
  children,
  className,
  ...rest
}) => {
  const typeClass = type === 'text32' ? styles.tabText32 : '';
  const stateClass = isActive ? styles.tabActive : styles.tabDefault;

  return (
    <button
      className={`${styles.tab} ${typeClass} ${stateClass} ${className || ''}`.trim()}
      {...rest}
    >
      <span className={styles.tabContent}>
        <span className={styles.tabLabel}>{children}</span>
      </span>
    </button>
  );
};
