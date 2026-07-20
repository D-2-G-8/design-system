import React, { ReactNode, HTMLAttributes } from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
  resizable?: boolean;
  theme?: 'light' | 'dark';
  mobile?: boolean;
  children?: ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  placement = 'bottom',
  resizable = false,
  theme = 'dark',
  mobile = false,
  children,
  className,
  ...props
}) => {
  const placementClassMap: Record<string, string> = {
    'top': styles.tooltipTop,
    'top-start': styles.tooltipTopStart,
    'top-end': styles.tooltipTopEnd,
    'bottom': styles.tooltipBottom,
    'bottom-start': styles.tooltipBottomStart,
    'bottom-end': styles.tooltipBottomEnd,
    'left': styles.tooltipLeft,
    'left-start': styles.tooltipLeftStart,
    'left-end': styles.tooltipLeftEnd,
    'right': styles.tooltipRight,
    'right-start': styles.tooltipRightStart,
    'right-end': styles.tooltipRightEnd,
  };

  const tooltipClasses = [
    styles.tooltip,
    theme === 'light' ? styles.tooltipLight : styles.tooltipDark,
    placementClassMap[placement],
    resizable && styles.tooltipResizable,
    mobile && styles.tooltipMobile,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={tooltipClasses} {...props}>
      <div className={styles.tooltipArrow} />
      <div className={styles.tooltipContent}>{children}</div>
    </div>
  );
};
