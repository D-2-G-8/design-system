import React from 'react';
import styles from './CrossPimSidemenuParent.module.css';

export interface CrossPimSidemenuParentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  children?: React.ReactNode;
}

export const CrossPimSidemenuParent: React.FC<CrossPimSidemenuParentProps> = ({
  isOpen = false,
  onClose,
  title,
  children,
  className,
  ...rest
}) => {
  const containerClasses = [
    styles.container,
    isOpen ? styles.open : styles.close,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...rest}>
      <div className={styles.menuContent}>
        {title && (
          <div className={styles.menuHeader}>
            {title}
          </div>
        )}
        <div className={styles.menuList}>
          {children}
        </div>
      </div>
    </div>
  );
};
