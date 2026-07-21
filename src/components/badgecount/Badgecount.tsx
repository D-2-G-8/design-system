import React from 'react';
import styles from './Badgecount.module.scss';

export interface BadgecountProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The numeric or text value displayed inside the badge; pass a number for counts (e.g. 5) or a short string (e.g. "99+"), or omit to render the XS dot-only variant.
   */
  value?: string | number;
  
  /**
   * Visual size of the badge; defaults to '24' for typical notification counts, use 'xs' for a small indicator dot without text, and '32' for prominent counters.
   */
  size?: 'xs' | '16' | '20' | '24' | '32';
  
  /**
   * Color theme of the badge; 'default' is white background, 'negative' is red for errors/alerts, 'neutral' is gray, and 'accent' is black; defaults to 'default'.
   */
  appearance?: 'default' | 'negative' | 'neutral' | 'accent';
  
  /**
   * Whether to use squared corners (8px/12px radius depending on size) instead of fully rounded pill shape; defaults to false for the standard pill appearance.
   */
  squared?: boolean;
}

export const Badgecount: React.FC<BadgecountProps> = ({
  value,
  size = '24',
  appearance = 'default',
  squared = false,
  className,
  ...props
}) => {
  const sizeClass = {
    'xs': styles.sizeXs,
    '16': styles.size16,
    '20': styles.size20,
    '24': styles.size24,
    '32': styles.size32,
  }[size];

  const appearanceClass = {
    'default': styles.appearanceDefault,
    'negative': styles.appearanceNegative,
    'neutral': styles.appearanceNeutral,
    'accent': styles.appearanceAccent,
  }[appearance];

  const classes = [
    styles.badgeCount,
    sizeClass,
    appearanceClass,
    squared && styles.squared,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {value !== undefined && size !== 'xs' && (
        <span className={styles.valueText}>{value}</span>
      )}
    </div>
  );
};
