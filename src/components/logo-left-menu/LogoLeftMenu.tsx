import React from 'react';
import styles from './LogoLeftMenu.module.css';

export interface LogoLeftMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  logo: 'on' | 'off';
}

export const LogoLeftMenu: React.FC<LogoLeftMenuProps> = ({
  logo,
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.logoLeftMenu} ${logo === 'on' ? styles.logoVisible : styles.logoHidden} ${className || ''}`}
      {...props}
    >
      <div className={styles.container}>
        {logo === 'on' && (
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="8" fill="currentColor"/>
          </svg>
        )}
      </div>
    </div>
  );
};
