import React from 'react';
import styles from './Badgecount.module.scss';

export interface BadgecountProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string | number;
  size?: 'xs' | '16' | '20' | '24' | '32';
  appearance?: 'default' | 'negative' | 'neutral' | 'accent';
  square?: boolean;
}

export const Badgecount: React.FC<BadgecountProps> = ({
  value,
  size = '32',
  appearance = 'default',
  square = false,
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

  const shapeClass = square ? styles.square : styles.rounded;

  return (
    <div
      className={`${styles.badgeCount} ${sizeClass} ${appearanceClass} ${shapeClass} ${className || ''}`.trim()}
      {...props}
    >
      {size !== 'xs' && value !== undefined && (
        <span className={styles.value}>{value}</span>
      )}
    </div>
  );
};
