import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  size: 24 | 32 | 40;
  type: 'label' | 'emoji' | 'icon' | 'lottie' | 'logo';
  appearance: 'default' | 'success' | 'info' | 'error' | 'warning';
  fill: boolean;
  theme: 'light' | 'dark';
  children?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  size,
  type,
  appearance,
  fill,
  theme,
  children,
  className,
  ...props
}) => {
  const sizeClass = size === 24 ? styles.size24 : size === 32 ? styles.size32 : styles.size40;
  const typeClass = type === 'label' ? styles.typeLabel :
                    type === 'emoji' ? styles.typeEmoji :
                    type === 'icon' ? styles.typeIcon :
                    type === 'lottie' ? styles.typeLottie :
                    styles.typeLogo;
  const appearanceClass = appearance === 'default' ? styles.appearanceDefault :
                          appearance === 'success' ? styles.appearanceSuccess :
                          appearance === 'info' ? styles.appearanceInfo :
                          appearance === 'error' ? styles.appearanceError :
                          styles.appearanceWarning;
  const fillClass = fill ? styles.filled : styles.unfilled;
  const themeClass = theme === 'light' ? styles.themeLight : styles.themeDark;

  return (
    <div
      className={`${styles.badge} ${sizeClass} ${typeClass} ${appearanceClass} ${fillClass} ${themeClass} ${className || ''}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};
