import React from 'react';
import styles from './Damleftnavigationparent.module.css';

export interface DamleftnavigationparentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
}

export const Damleftnavigationparent: React.FC<DamleftnavigationparentProps> = ({
  isOpen,
  children,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.container} ${className || ''}`} {...props}>
      <div className={styles.label}>
        <span className={isOpen ? styles.iconRotated : styles.icon} />
      </div>
      <div className={`${styles.content} ${isOpen ? styles.contentOpen : styles.contentClosed}`}>
        {children}
      </div>
    </div>
  );
};
