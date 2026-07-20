import React from 'react';
import styles from './Iconbutton.module.css';

export interface IconbuttonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size: 24 | 32 | 40 | 52;
  appearance: 'primary' | 'secondary' | 'tertiary' | 'blur';
  theme?: 'light' | 'dark';
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Iconbutton = React.forwardRef<HTMLButtonElement, IconbuttonProps>(
  ({ size, appearance, theme = 'dark', disabled = false, className, children, ...props }, ref) => {
    const sizeClass = {
      24: styles.size24,
      32: styles.size32,
      40: styles.size40,
      52: styles.size52,
    }[size];

    const appearanceClass = {
      primary: styles.appearancePrimary,
      secondary: styles.appearanceSecondary,
      tertiary: styles.appearanceTertiary,
      blur: styles.appearanceBlur,
    }[appearance];

    const themeClass = theme === 'light' ? styles.themeLight : styles.themeDark;

    const classNames = [
      styles.iconButton,
      sizeClass,
      appearanceClass,
      themeClass,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Iconbutton.displayName = 'Iconbutton';
