import React from 'react';
import styles from './Tooltip.module.scss';

export interface TooltipProps {
  placement: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
  resizable: boolean;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  placement,
  resizable,
  children
}) => {
  const placementClass = {
    'top': styles.placementTop,
    'top-start': styles.placementTopStart,
    'top-end': styles.placementTopEnd,
    'bottom': styles.placementBottom,
    'bottom-start': styles.placementBottomStart,
    'bottom-end': styles.placementBottomEnd,
    'left': styles.placementLeft,
    'left-start': styles.placementLeftStart,
    'left-end': styles.placementLeftEnd,
    'right': styles.placementRight,
    'right-start': styles.placementRightStart,
    'right-end': styles.placementRightEnd,
  }[placement];

  const isTopPlacement = placement.startsWith('top');
  const isBottomPlacement = placement.startsWith('bottom');
  const isLeftPlacement = placement.startsWith('left');
  const isRightPlacement = placement.startsWith('right');

  const renderArrow = () => (
    <div className={styles.arrow}>
      <svg
        width={isTopPlacement || isBottomPlacement ? 28 : 8}
        height={isTopPlacement || isBottomPlacement ? 8 : 28}
        viewBox={isTopPlacement || isBottomPlacement ? "0 0 28 8" : "0 0 8 28"}
        fill="none"
      >
        {isTopPlacement && (
          <path d="M14 8L0 0H28L14 8Z" fill="currentColor" />
        )}
        {isBottomPlacement && (
          <path d="M14 0L28 8H0L14 0Z" fill="currentColor" />
        )}
        {isLeftPlacement && (
          <path d="M8 14L0 0V28L8 14Z" fill="currentColor" />
        )}
        {isRightPlacement && (
          <path d="M0 14L8 28V0L0 14Z" fill="currentColor" />
        )}
      </svg>
    </div>
  );

  return (
    <div className={`${styles.tooltip} ${placementClass} ${resizable ? styles.resizable : ''}`}>
      {(isTopPlacement || isLeftPlacement) && (
        <>
          <div className={styles.content}>
            {children}
          </div>
          {renderArrow()}
        </>
      )}
      {(isBottomPlacement || isRightPlacement) && (
        <>
          {renderArrow()}
          <div className={styles.content}>
            {children}
          </div>
        </>
      )}
    </div>
  );
};
