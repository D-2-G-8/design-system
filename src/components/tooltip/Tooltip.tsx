import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.scss';

export interface TooltipProps {
  /**
   * Positions the tooltip relative to its anchor element.
   * Defaults to 'top' if omitted.
   */
  placement?: 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' | 'right' | 'right-start' | 'right-end';
  
  /**
   * Controlled visibility state.
   * Pass together with onOpenChange to drive tooltip visibility from the parent, or omit both to let the component manage its own hover/focus interactions.
   */
  open?: boolean;
  
  /**
   * Initial visibility state when uncontrolled.
   * Ignored if open is provided, defaults to false.
   */
  defaultOpen?: boolean;
  
  /**
   * Callback fired whenever the tooltip visibility changes, either via hover/focus or programmatic control.
   * Use with open to implement controlled mode.
   */
  onOpenChange?: (open: boolean) => void;
  
  /**
   * The element that triggers the tooltip on hover/focus.
   */
  children: React.ReactNode;
  
  /**
   * The content to display inside the tooltip.
   */
  content: React.ReactNode;
  
  /**
   * Whether the tooltip can resize to accommodate wider content.
   * When false, content is constrained to 93px width.
   * When true, content can expand up to 140px.
   * Defaults to false.
   */
  resizable?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  placement = 'top',
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  content,
  resizable = false
}) => {
  const [openState, setOpenState] = useState(defaultOpen);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const effectiveOpen = open ?? openState;
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (open === undefined) {
      setOpenState(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const handleMouseEnter = () => {
    handleOpenChange(true);
  };

  const handleMouseLeave = () => {
    handleOpenChange(false);
  };

  const handleFocus = () => {
    handleOpenChange(true);
  };

  const handleBlur = () => {
    handleOpenChange(false);
  };

  useEffect(() => {
    if (!effectiveOpen || !triggerRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const gap = 8; // Arrow height

      let top = 0;
      let left = 0;

      // Calculate based on placement
      if (placement.startsWith('top')) {
        top = triggerRect.top - tooltipRect.height - gap;
        if (placement === 'top-start') {
          left = triggerRect.left;
        } else if (placement === 'top-end') {
          left = triggerRect.right - tooltipRect.width;
        } else {
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        }
      } else if (placement.startsWith('bottom')) {
        top = triggerRect.bottom + gap;
        if (placement === 'bottom-start') {
          left = triggerRect.left;
        } else if (placement === 'bottom-end') {
          left = triggerRect.right - tooltipRect.width;
        } else {
          left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        }
      } else if (placement.startsWith('left')) {
        left = triggerRect.left - tooltipRect.width - gap;
        if (placement === 'left-start') {
          top = triggerRect.top;
        } else if (placement === 'left-end') {
          top = triggerRect.bottom - tooltipRect.height;
        } else {
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        }
      } else if (placement.startsWith('right')) {
        left = triggerRect.right + gap;
        if (placement === 'right-start') {
          top = triggerRect.top;
        } else if (placement === 'right-end') {
          top = triggerRect.bottom - tooltipRect.height;
        } else {
          top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        }
      }

      setPosition({ top, left });
    };

    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [effectiveOpen, placement]);

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
  const isTop = placement.startsWith('top');
  const isBottom = placement.startsWith('bottom');
  const isLeft = placement.startsWith('left');
  const isRight = placement.startsWith('right');

  const renderArrow = () => {
    if (isVertical) {
      return (
        <div className={styles.arrowFrame}>
          <div className={styles.arrow}>
            <svg width="28" height="8" viewBox="0 0 28 8" fill="none" style={{ display: 'block', width: '28px', height: '8px' }}>
              {isTop ? (
                <path d="M14 0L28 8H0L14 0Z" fill="currentColor" />
              ) : (
                <path d="M14 8L0 0H28L14 8Z" fill="currentColor" />
              )}
            </svg>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.arrowFrame}>
          <div className={styles.arrow}>
            <svg width="8" height="28" viewBox="0 0 8 28" fill="none" style={{ display: 'block', width: '8px', height: '28px' }}>
              {isLeft ? (
                <path d="M0 14L8 0V28L0 14Z" fill="currentColor" />
              ) : (
                <path d="M8 14L0 28V0L8 14Z" fill="currentColor" />
              )}
            </svg>
          </div>
        </div>
      );
    }
  };

  const tooltipContent = effectiveOpen && (
    <div 
      ref={tooltipRef}
      className={`${styles.tooltip} ${placementClass} ${effectiveOpen ? styles.visible : ''} ${resizable ? styles.resizable : ''}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className={styles.tooltipFrame}>
        {(isTop || isLeft) && (
          <>
            <div className={styles.content}>
              {content}
            </div>
            {renderArrow()}
          </>
        )}
        {(isBottom || isRight) && (
          <>
            {renderArrow()}
            <div className={styles.content}>
              {content}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>
      {effectiveOpen && typeof document !== 'undefined' && createPortal(
        tooltipContent,
        document.body
      )}
    </>
  );
};