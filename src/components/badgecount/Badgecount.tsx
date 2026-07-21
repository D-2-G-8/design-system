import React from 'react';
import styles from './BadgeCount.module.scss';

export interface BadgecountProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The count or label to display inside the badge; can be a number like 5 or 99+, or a short string.
   * Omit for 'xs' size badges which render as dots without text.
   */
  value?: string | number;
  
  /**
   * Badge size in pixels or 'xs' for an 8×8 dot with no text.
   * Defaults to '24' for a standard numeric badge.
   */
  size?: 'xs' | '16' | '20' | '24' | '32';
  
  /**
   * Visual style of the badge: 'default' for white background, 'negative' for red (errors/alerts),
   * 'neutral' for gray, or 'accent' for black emphasis.
   * Defaults to 'default'.
   */
  appearance?: 'default' | 'negative' | 'neutral' | 'accent';
  
  /**
   * When true, uses a rounded-square shape instead of fully circular.
   * Defaults to false for circular badges.
   */
  square?: boolean;
}

export const Badgecount: React.FC<BadgecountProps> = ({
  value,
  size = '24',
  appearance = 'default',
  square = false,
  className,
  ...rest
}) => {
  const sizeClass = 
    size === 'xs' ? styles.sizeXs :
    size === '16' ? styles.size16 :
    size === '20' ? styles.size20 :
    size === '24' ? styles.size24 :
    styles.size32;
  
  const appearanceClass =
    appearance === 'negative' ? styles.appearanceNegative :
    appearance === 'neutral' ? styles.appearanceNeutral :
    appearance === 'accent' ? styles.appearanceAccent :
    styles.appearanceDefault;
  
  const rootClasses = [
    styles.root,
    sizeClass,
    appearanceClass,
    square && styles.square,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={rootClasses} {...rest}>
      {size !== 'xs' && value !== undefined && (
        <span className={styles.value}>{value}</span>
      )}
    </div>
  );
};