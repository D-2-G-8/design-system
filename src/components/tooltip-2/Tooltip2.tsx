import React from 'react';
import styles from './Tooltip2.module.css';

export interface Tooltip2Props extends React.HTMLAttributes<HTMLDivElement> {
  direction: 'up' | 'left' | 'right' | 'down';
  theme: 'light' | 'dark';
  appearance: 'mobile' | 'desktop';
  leftAligned: boolean;
  rightAligned: boolean;
  children?: React.ReactNode;
}

export function Tooltip2({
  direction,
  theme,
  appearance,
  leftAligned,
  rightAligned,
  className,
  children,
  ...props
}: Tooltip2Props) {
  const directionClass = direction === 'up' 
    ? styles.tooltipUp 
    : direction === 'down'
    ? styles.tooltipDown
    : direction === 'left'
    ? styles.tooltipLeft
    : styles.tooltipRight;

  const themeClass = theme === 'light' ? styles.tooltipLight : styles.tooltipDark;
  const appearanceClass = appearance === 'mobile' ? styles.tooltipMobile : styles.tooltipDesktop;
  const leftAlignedClass = leftAligned ? styles.tooltipLeftAligned : '';
  const rightAlignedClass = rightAligned ? styles.tooltipRightAligned : '';

  const classes = [
    styles.tooltip,
    directionClass,
    themeClass,
    appearanceClass,
    leftAlignedClass,
    rightAlignedClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      <div className={styles.arrow} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
