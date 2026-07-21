import React from 'react';
import styles from './Tooltip.module.scss';

export interface TooltipProps {
  /**
   * Controls the position of the tooltip relative to its trigger element.
   * Pass one of twelve values to align the tooltip to the top, bottom, left, or right,
   * with optional 'Start' or 'End' suffixes for precise corner alignment.
   * Defaults to 'top' if omitted.
   */
  placement?: 'top' | 'topStart' | 'topEnd' | 'bottom' | 'bottomStart' | 'bottomEnd' | 'left' | 'leftStart' | 'leftEnd' | 'right' | 'rightStart' | 'rightEnd';
  
  /**
   * The content to display inside the tooltip.
   * Typically a short text string but can be any renderable React node.
   */
  children: React.ReactNode;
  
  /**
   * Controlled open state for the tooltip.
   * When provided, this value determines whether the tooltip is visible.
   * Pass together with onOpenChange to drive visibility from the parent (controlled mode).
   * Omit to let the component manage its own open/closed state based on hover/focus (uncontrolled mode).
   */
  open?: boolean;
  
  /**
   * Initial open state when the tooltip is uncontrolled.
   * Only used when 'open' is not provided; sets whether the tooltip starts visible.
   * Defaults to false if omitted. Ignored if 'open' is provided.
   */
  defaultOpen?: boolean;
  
  /**
   * Callback fired whenever the tooltip's visibility changes.
   * Receives the new open state as a boolean argument.
   * Use with 'open' prop for controlled mode, or omit for uncontrolled mode.
   * In uncontrolled mode, allows parent to observe state changes.
   */
  onOpenChange?: (open: boolean) => void;
  
  /**
   * The trigger element that the tooltip is attached to.
   * The tooltip will position itself relative to this element.
   */
  trigger: React.ReactNode;
  
  /**
   * Controls whether the tooltip content is resizable (wider).
   * When true, applies wider width (140px vs 93px).
   * Defaults to false if omitted.
   */
  resizable?: boolean;
  
  /**
   * Switches to mobile variant with different typography and padding.
   * Uses TT Norms font, 16px/22px line-height, and 10px vertical padding.
   * Defaults to false if omitted.
   */
  isMobile?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  placement = 'top',
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  resizable = false,
  isMobile = false,
}) => {
  const [openState, setOpenState] = React.useState(defaultOpen);
  const effectiveOpen = open ?? openState;

  const handleMouseEnter = () => {
    const nextOpen = true;
    if (open === undefined) {
      setOpenState(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleMouseLeave = () => {
    const nextOpen = false;
    if (open === undefined) {
      setOpenState(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleFocus = () => {
    const nextOpen = true;
    if (open === undefined) {
      setOpenState(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleBlur = () => {
    const nextOpen = false;
    if (open === undefined) {
      setOpenState(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const placementClass = {
    top: styles.placementTop,
    topStart: styles.placementTopStart,
    topEnd: styles.placementTopEnd,
    bottom: styles.placementBottom,
    bottomStart: styles.placementBottomStart,
    bottomEnd: styles.placementBottomEnd,
    left: styles.placementLeft,
    leftStart: styles.placementLeftStart,
    leftEnd: styles.placementLeftEnd,
    right: styles.placementRight,
    rightStart: styles.placementRightStart,
    rightEnd: styles.placementRightEnd,
  }[placement];

  const isVertical = placement.startsWith('top') || placement.startsWith('bottom');
  const isHorizontal = placement.startsWith('left') || placement.startsWith('right');
  const isTop = placement.startsWith('top');
  const isBottom = placement.startsWith('bottom');
  const isLeft = placement.startsWith('left');
  const isRight = placement.startsWith('right');

  const contentClass = `${styles.content} ${resizable ? styles.resizable : ''} ${isMobile ? styles.mobile : ''}`;

  return (
    <div
      className={styles.tooltipWrapper}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {trigger}
      {effectiveOpen && (
        <div className={`${styles.tooltip} ${placementClass}`}>
          {isVertical && isTop && (
            <>
              <div className={contentClass}>
                {children}
              </div>
              <div className={styles.arrow}>
                <svg width="28" height="8" viewBox="0 0 28 8" fill="none">
                  <path d="M14 8L0 0H28L14 8Z" fill="currentColor" />
                </svg>
              </div>
            </>
          )}
          
          {isVertical && isBottom && (
            <>
              <div className={styles.arrow}>
                <svg width="28" height="8" viewBox="0 0 28 8" fill="none">
                  <path d="M14 0L0 8H28L14 0Z" fill="currentColor" />
                </svg>
              </div>
              <div className={contentClass}>
                {children}
              </div>
            </>
          )}
          
          {isHorizontal && isLeft && (
            <>
              <div className={contentClass}>
                {children}
              </div>
              <div className={styles.arrow}>
                <svg width="8" height="28" viewBox="0 0 8 28" fill="none">
                  <path d="M8 14L0 0V28L8 14Z" fill="currentColor" />
                </svg>
              </div>
            </>
          )}
          
          {isHorizontal && isRight && (
            <>
              <div className={styles.arrow}>
                <svg width="8" height="28" viewBox="0 0 8 28" fill="none">
                  <path d="M0 14L8 0V28L0 14Z" fill="currentColor" />
                </svg>
              </div>
              <div className={contentClass}>
                {children}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};