import React from 'react';
import styles from './Rpcleftnavigationparent.module.css';

export interface RpcleftnavigationparentProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
}

export const Rpcleftnavigationparent: React.FC<RpcleftnavigationparentProps> = ({
  isOpen,
  children,
  className,
  ...props
}) => {
  return (
    <div 
      className={`${styles.container} ${className || ''}`}
      {...props}
    >
      <div 
        className={`${styles.navigationParent} ${
          isOpen ? styles.navigationParentOpen : styles.navigationParentClose
        }`}
      >
        <div className={styles.label}>
          {/* Label content can be passed as children or prop */}
        </div>
        <div className={styles.icon}>
          {/* Icon content */}
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};
