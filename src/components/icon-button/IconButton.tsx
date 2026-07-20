import React from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme: 'light' | 'dark';
  appearance: 'secondary' | 'blur';
  size: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
  ariaLabel: string;
}

export function IconButton({
  theme,
  appearance,
  size,
  disabled = false,
  icon,
  onClick,
  ariaLabel,
  className,
  ...rest
}: IconButtonProps) {
  const themeClass = theme === 'light' ? styles.themeLight : styles.themeDark;
  const appearanceClass = appearance === 'secondary' ? styles.appearanceSecondary : styles.appearanceBlur;
  const sizeClass = size === 'xs' ? styles.sizeXs : size === 'sm' ? styles.sizeSm : size === 'md' ? styles.sizeMd : styles.sizeLg;
  const disabledClass = disabled ? styles.disabled : '';

  const classes = [
    styles.iconButton,
    themeClass,
    appearanceClass,
    sizeClass,
    disabledClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      type="button"
      {...rest}
    >
      <span className={styles.iconWrapper}>
        {icon}
      </span>
    </button>
  );
}
