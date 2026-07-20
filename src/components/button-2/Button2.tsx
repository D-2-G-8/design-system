import React from 'react';
import styles from './Button2.module.css';

export interface Button2Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  appearance: 'primary' | 'secondary' | 'blur';
  size: 'xsmall' | 'small' | 'medium' | 'large';
  icon: 'none' | 'left';
  theme: 'light' | 'default';
  children?: React.ReactNode;
}

export const Button2: React.FC<Button2Props> = ({
  appearance,
  size,
  icon,
  theme,
  className,
  disabled,
  children,
  ...rest
}) => {
  const classNames = [
    styles.button,
    styles[appearance],
    styles[size],
    icon === 'left' ? styles.iconLeft : styles.iconNone,
    theme === 'light' ? styles.themeLight : styles.themeDefault,
    disabled && styles.disabled,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classNames}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};
