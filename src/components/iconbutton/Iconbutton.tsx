import React, { useState } from 'react';
import styles from './Iconbutton.module.scss';
import { Badgecount } from '../badgecount';

export interface IconbuttonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size: '24px' | '32px' | '40px' | '52px';
  appearance: 'primary' | 'secondary' | 'tertiary';
  disabled?: boolean;
  icon: React.ReactNode;
  badgeCount?: number;
  tooltip?: string;
  tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Iconbutton: React.FC<IconbuttonProps> = ({
  size,
  appearance,
  disabled = false,
  icon,
  badgeCount,
  tooltip,
  tooltipPosition = 'top',
  onClick,
  className,
  ...rest
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClass =
    size === '24px'
      ? styles.size24px
      : size === '32px'
      ? styles.size32px
      : size === '40px'
      ? styles.size40px
      : styles.size52px;

  const appearanceClass =
    appearance === 'primary'
      ? styles.appearancePrimary
      : appearance === 'secondary'
      ? styles.appearanceSecondary
      : styles.appearanceTertiary;

  const buttonClasses = [
    styles.iconButton,
    sizeClass,
    appearanceClass,
    disabled ? styles.disabled : '',
    badgeCount ? styles.withBadge : '',
    tooltip ? styles.withTooltip : '',
    className || ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => tooltip && setShowTooltip(true)}
      onMouseLeave={() => tooltip && setShowTooltip(false)}
    >
      <button
        type="button"
        className={buttonClasses}
        disabled={disabled}
        onClick={onClick}
        {...rest}
      >
        {icon}
      </button>

      {tooltip && showTooltip && (
        <div className={styles.tooltipWrapper}>
          {tooltip}
        </div>
      )}

      {badgeCount !== undefined && badgeCount > 0 && (
        <div className={styles.badgeContainer}>
          <Badgecount
            value={badgeCount}
            size="XS"
            appearance="Negative"
            square={false}
          />
        </div>
      )}
    </div>
  );
};
