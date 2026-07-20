import React from 'react';
import styles from './Logo.module.css';

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  logo: 'lecar';
  type: 'product' | 'service';
}

export const Logo: React.FC<LogoProps> = ({
  logo,
  type,
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.logoContainer} ${className || ''}`}
      {...props}
    >
      <div
        className={`${styles.logo} ${
          logo === 'lecar' ? styles.logoLecar : ''
        } ${type === 'product' ? styles.typeProduct : styles.typeService}`}
      />
    </div>
  );
};
