import React from 'react';
import styles from './Badgecount.module.scss';

export interface BadgecountProps {
  /** The numeric or text value displayed inside the badge; pass a number for counts or a short string for labels. */
  value?: string | number;
  /** Visual size of the badge in pixels; defaults to '24' if omitted, with 'xs' rendering an 8px dot without text. */
  size?: 'xs' | '16' | '20' | '24' | '32';
  /** Color theme of the badge; 'default' uses white background, 'negative' uses red, 'neutral' uses gray, 'accent' uses black, defaults to 'default' if omitted. */
  appearance?: 'default' | 'negative' | 'neutral' | 'accent';
  /** Whether to render the badge with square corners instead of fully rounded; pass true for square, omit or pass false for rounded. */
  square?: boolean;
}

export const Badgecount: React.FC<BadgecountProps> = ({
  value,
  size = '24',
  appearance = 'default',
  square = false,
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

  return (
    <div
      className={`${styles.root} ${sizeClass} ${appearanceClass} ${square ? styles.square : ''}`}
    >
      {size !== 'xs' && value !== undefined && (
        <span className={styles.value}>{value}</span>
      )}
    </div>
  );
};