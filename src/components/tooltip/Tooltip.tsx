import React from 'react';
import styles from './Tooltip.module.scss';

export interface TooltipProps {
  /**
   * Controls the tooltip's position relative to its trigger element.
   * Defaults to 'top' if omitted.
   */
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
  
  /**
   * Controlled open state.
   * Pass together with onOpenChange to drive visibility from the parent.
   * Omit both `open` and `onOpenChange` to let the component manage its own show/hide state on hover/focus.
   */
  open?: boolean;
  
  /**
   * Initial open state when uncontrolled.
   * Ignored if `open` is provided. Defaults to false if omitted.
   */
  defaultOpen?: boolean;
  
  /**
   * Callback fired every time the tooltip's visibility changes (on hover/focus/blur).
   * Required when using controlled `open` prop to observe state changes.
   */
  onOpenChange?: (open: boolean) => void;
  
  /**
   * The trigger element (button, icon, text) that the user hovers or focuses to show the tooltip.
   * Required.
   */
  children: React.ReactNode;
  
  /**
   * The text or content displayed inside the tooltip bubble.
   * Required.
   */
  content: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  placement = 'top',
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  content,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;
  
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    const nextOpen = true;
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleMouseLeave = () => {
    const nextOpen = false;
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleFocus = () => {
    const nextOpen = true;
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleBlur = () => {
    const nextOpen = false;
    if (controlledOpen === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

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

  const isVertical = placement.startsWith('top') || placement.startsWith('bottom');
  const isHorizontal = placement.startsWith('left') || placement.startsWith('right');
  const isTop = placement.startsWith('top');
  const isBottom = placement.startsWith('bottom');
  const isLeft = placement.startsWith('left');
  const isRight = placement.startsWith('right');

  const renderArrow = () => {
    if (isVertical) {
      return (
        <svg width="28" height="8" viewBox="0 0 28 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          {isTop ? (
            <path d="M14 8L0 0H28L14 8Z" fill="var(--label-light-primary)" />
          ) : (
            <path d="M14 0L28 8H0L14 0Z" fill="var(--label-light-primary)" />
          )}
        </svg>
      );
    } else {
      return (
        <svg width="8" height="28" viewBox="0 0 8 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          {isLeft ? (
            <path d="M8 14L0 28V0L8 14Z" fill="var(--label-light-primary)" />
          ) : (
            <path d="M0 14L8 0V28L0 14Z" fill="var(--label-light-primary)" />
          )}
        </svg>
      );
    }
  };

  const renderTooltipContent = () => {
    if (isTop || isLeft) {
      return (
        <>
          <div className={styles.content}>
            <span>{content}</span>
          </div>
          <div className={styles.arrow}>
            {renderArrow()}
          </div>
        </>
      );
    } else {
      return (
        <>
          <div className={styles.arrow}>
            {renderArrow()}
          </div>
          <div className={styles.content}>
            <span>{content}</span>
          </div>
        </>
      );
    }
  };

  return (
    <div
      ref={triggerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      <div
        ref={tooltipRef}
        className={`${styles.tooltip} ${placementClass} ${isOpen ? styles.open : ''}`}
      >
        {renderTooltipContent()}
      </div>
    </div>
  );
};
