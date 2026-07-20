import React from 'react';
import styles from './SideMenuLecarSellerS.module.css';

export interface SideMenuLecarSellerSProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'default' | 'variant2';
}

export const SideMenuLecarSellerS: React.FC<SideMenuLecarSellerSProps> = ({
  variant,
  className,
  ...props
}) => {
  const variantClass = variant === 'variant2' ? styles.menuItemVariant2 : styles.menuItemDefault;

  return (
    <div className={`${styles.sideMenu} ${className || ''}`} {...props}>
      <div className={styles.menuContainer}>
        <div className={styles.menuSection}>
          <div className={styles.menuHeader}>Menu</div>
          <div className={`${styles.menuItem} ${variantClass}`}>
            <span className={styles.menuIcon}></span>
            <span className={styles.menuText}>Dashboard</span>
          </div>
          <div className={`${styles.menuItem} ${variantClass}`}>
            <span className={styles.menuIcon}></span>
            <span className={styles.menuText}>Products</span>
          </div>
          <div className={`${styles.menuItem} ${styles.menuItemActive} ${variantClass}`}>
            <span className={styles.menuIcon}></span>
            <span className={styles.menuText}>Orders</span>
          </div>
          <div className={`${styles.menuItem} ${variantClass}`}>
            <span className={styles.menuIcon}></span>
            <span className={styles.menuText}>Customers</span>
          </div>
          <div className={styles.menuDivider}></div>
          <div className={`${styles.menuItem} ${variantClass}`}>
            <span className={styles.menuIcon}></span>
            <span className={styles.menuText}>Analytics</span>
          </div>
          <div className={`${styles.menuItem} ${variantClass}`}>
            <span className={styles.menuIcon}></span>
            <span className={styles.menuText}>Settings</span>
          </div>
        </div>
      </div>
    </div>
  );
};
