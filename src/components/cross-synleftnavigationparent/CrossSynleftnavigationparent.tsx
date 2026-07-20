import React from 'react';
import styles from './CrossSynleftnavigationparent.module.css';

export interface CrossSynleftnavigationparentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
}

export const CrossSynleftnavigationparent: React.FC<CrossSynleftnavigationparentProps> = ({
  isOpen,
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={`${styles.container} ${isOpen ? styles.containerOpen : styles.containerClose} ${className || ''}`}
      {...props}
    >
      <div className={styles.header}>
        <button className={styles.toggle}>
          <span className={styles.icon} />
        </button>
      </div>
      <nav className={styles.content}>
        {children}
      </nav>
    </div>
  );
};
