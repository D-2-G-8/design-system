import React, { useState } from 'react';
import styles from './Iconbutton.module.scss';
import { Badgecount } from '../badgecount';
import { Tooltip } from '../tooltip';

export interface IconbuttonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * The icon to display inside the button; pass a React element from your icon library or design system.
   * Must be sized correctly: 24px for sizes 52/40, 16px for sizes 32/24.
   */
  icon: React.ReactNode;
  
  /**
   * Button size in pixels; defaults to '40'.
   */
  size?: '24' | '32' | '40' | '52';
  
  /**
   * Visual style of the button: 'primary' for solid black fill, 'secondary' for light gray fill, 'tertiary' for white/transparent fill; defaults to 'primary'.
   */
  appearance?: 'primary' | 'secondary' | 'tertiary';
  
  /**
   * When true, the button is non-interactive and styled in a disabled state; defaults to false.
   */
  disabled?: boolean;
  
  /**
   * When true, the button shows the active/pressed state independent of mouse interaction; defaults to false.
   */
  active?: boolean;
  
  /**
   * Optional numeric badge to display in the top-right corner of the button; omit to hide the badge.
   */
  badgeCount?: number;
  
  /**
   * Optional tooltip text to show on hover; omit to hide the tooltip.
   */
  tooltipText?: string;
  
  /**
   * Position of the tooltip relative to the button; defaults to 'top'.
   */
  tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
}

export const Iconbutton: React.FC<IconbuttonProps> = ({
  icon,
  size = '40',
  appearance = 'primary',
  disabled = false,
  active = false,
  badgeCount,
  tooltipText,
  tooltipPosition = 'top',
  className,
  ...rest
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClass = {
    '24': styles.size24,
    '32': styles.size32,
    '40': styles.size40,
    '52': styles.size52,
  }[size];

  const appearanceClass = {
    primary: styles.appearancePrimary,
    secondary: styles.appearanceSecondary,
    tertiary: styles.appearanceTertiary,
  }[appearance];

  const buttonClasses = [
    styles.iconButton,
    sizeClass,
    appearanceClass,
    disabled && styles.disabled,
    active && !disabled && styles.active,
    badgeCount !== undefined && styles.withBadge,
    tooltipText && styles.withTooltip,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Determine icon size based on button size: 24px for 52/40, 16px for 32/24
  const iconSize = (size === '52' || size === '40') ? '24' : '16';
  const iconSizeClass = iconSize === '24' ? styles.icon24 : styles.icon16;

  const styledIcon = React.isValidElement(icon) ? (
    <span className={iconSizeClass}>{icon}</span>
  ) : (
    icon
  );

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...rest}
    >
      {styledIcon}
      
      {tooltipText && showTooltip && !disabled && (
        <div className={styles.tooltipContainer}>
          <Tooltip text={tooltipText} position={tooltipPosition} />
        </div>
      )}
      
      {badgeCount !== undefined && (
        <div className={styles.badgeContainer}>
          <Badgecount
            value={badgeCount}
            size="XS"
            appearance="Negative"
            square={false}
          />
        </div>
      )}
    </button>
  );
};