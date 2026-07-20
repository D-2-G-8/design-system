import React from 'react';
import styles from './Bage.module.css';

export interface BageProps extends React.HTMLAttributes<HTMLSpanElement> {
  appearance?: 'primary';
  size?: 'xs' | 'sm';
  icon?: 'left' | 'right' | 'none';
  logo?: boolean;
  emoji?: boolean;
  theme?: 'light';
  color?: string;
  children?: React.ReactNode;
}

export const Bage: React.FC<BageProps> = ({
  appearance = 'primary',
  size = 'sm',
  icon = 'none',
  logo = false,
  emoji = false,
  theme = 'light',
  color,
  className,
  style,
  children,
  ...rest
}) => {
  const classNames = [
    styles.badge,
    appearance === 'primary' && styles.badgePrimary,
    size === 'xs' && styles.badgeXs,
    size === 'sm' && styles.badgeSm,
    icon === 'left' && styles.iconLeft,
    icon === 'right' && styles.iconRight,
    icon === 'none' && styles.iconNone,
    logo && styles.withLogo,
    emoji && styles.withEmoji,
    theme === 'light' && styles.themeLight,
    className
  ]
    .filter(Boolean)
    .join(' ');

  const inlineStyle = color ? { ...style, '--badge-color': color } as React.CSSProperties : style;

  return (
    <span className={classNames} style={inlineStyle} {...rest}>
      {children}
    </span>
  );
};
