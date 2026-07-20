import React from 'react';
import styles from './NavBarButtonB2b.module.css';

export interface NavBarButtonB2bProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: boolean;
  icon: boolean;
  state: 'default' | 'hover' | 'active' | 'toggled';
}

export const NavBarButtonB2b: React.FC<NavBarButtonB2bProps> = ({
  text,
  icon,
  state,
  className,
  children,
  ...props
}) => {
  const stateClass = {
    default: styles.navButtonDefault,
    hover: styles.navButtonHover,
    active: styles.navButtonActive,
    toggled: styles.navButtonToggled,
  }[state];

  const variantClass = 
    text && icon ? styles.navButtonWithText :
    icon && !text ? styles.navButtonIconOnly :
    text && !icon ? styles.navButtonTextOnly :
    '';

  const combinedClassName = [
    styles.navButton,
    stateClass,
    variantClass,
    text && styles.navButtonWithText,
    icon && styles.navButtonWithIcon,
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={combinedClassName} {...props}>
      {icon && <span className={styles.icon}>{/* Icon placeholder */}</span>}
      {text && <span className={styles.text}>{children}</span>}
    </button>
  );
};
