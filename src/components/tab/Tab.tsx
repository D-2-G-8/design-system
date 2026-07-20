import React from 'react';
import styles from './Tab.module.css';

export interface TabProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  style: 'fat' | 'thick';
  size: 'sm' | 'md' | 'lg';
  active: boolean;
  appearance: 'primary';
  children?: React.ReactNode;
}

export const Tab: React.FC<TabProps> = ({
  style: styleVariant,
  size,
  active,
  appearance,
  className,
  children,
  ...props
}) => {
  const classNames = [
    styles.tab,
    styleVariant === 'fat' ? styles.tabFat : styles.tabThick,
    size === 'sm' ? styles.tabSmall : size === 'md' ? styles.tabMedium : styles.tabLarge,
    active ? styles.tabActive : styles.tabInactive,
    appearance === 'primary' ? styles.tabPrimary : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classNames} {...props}>
      <span className={styles.tabContent}>{children}</span>
    </button>
  );
};
