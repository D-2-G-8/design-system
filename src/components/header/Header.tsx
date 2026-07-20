import React from 'react';
import styles from './Header.module.css';

export interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  navItems?: Array<{
    label: string;
    href: string;
  }>;
  actions?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  logo,
  navItems,
  actions,
  className,
  ...props
}) => {
  return (
    <header className={`${styles.header} ${className || ''}`.trim()} {...props}>
      <div className={styles.container}>
        {logo && <div className={styles.logo}>{logo}</div>}
        
        {navItems && navItems.length > 0 && (
          <nav className={styles.nav}>
            <ul className={styles.navList}>
              {navItems.map((item, index) => (
                <li key={index} className={styles.navItem}>
                  <a href={item.href} className={styles.navLink}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
};
