import React from 'react';
import styles from './Cursor.module.css';

export interface CursorProps extends React.HTMLAttributes<HTMLDivElement> {
  step: boolean;
  variant?: 'default' | 'not-allowed' | 'pointer' | 'vertical-text' | 'text' | 'crosshair' | 'cell' | 'zoom-out' | 'zoom-in' | 'grabbing' | 'grab' | 'no-drop' | 'move' | 'copy' | 'alias' | 'nwse-resize' | 'nesw-resize' | 'ns-resize' | 'ew-resize' | 'sw-resize' | 'se-resize' | 'nw-resize' | 'ne-resize' | 'w-resize' | 's-resize' | 'e-resize' | 'n-resize' | 'row-resize' | 'col-resize' | 'progress' | 'help' | 'context-menu';
}

export const Cursor: React.FC<CursorProps> = ({
  step,
  variant = 'default',
  className,
  ...props
}) => {
  const variantClassMap: Record<NonNullable<CursorProps['variant']>, string> = {
    'default': styles.cursorDefault,
    'not-allowed': styles.cursorNotAllowed,
    'pointer': styles.cursorPointer,
    'vertical-text': styles.cursorVerticalText,
    'text': styles.cursorText,
    'crosshair': styles.cursorCrosshair,
    'cell': styles.cursorCell,
    'zoom-out': styles.cursorZoomOut,
    'zoom-in': styles.cursorZoomIn,
    'grabbing': styles.cursorGrabbing,
    'grab': styles.cursorGrab,
    'no-drop': styles.cursorNoDrop,
    'move': styles.cursorMove,
    'copy': styles.cursorCopy,
    'alias': styles.cursorAlias,
    'nwse-resize': styles.cursorNwseResize,
    'nesw-resize': styles.cursorNeswResize,
    'ns-resize': styles.cursorNsResize,
    'ew-resize': styles.cursorEwResize,
    'sw-resize': styles.cursorSwResize,
    'se-resize': styles.cursorSeResize,
    'nw-resize': styles.cursorNwResize,
    'ne-resize': styles.cursorNeResize,
    'w-resize': styles.cursorWResize,
    's-resize': styles.cursorSResize,
    'e-resize': styles.cursorEResize,
    'n-resize': styles.cursorNResize,
    'row-resize': styles.cursorRowResize,
    'col-resize': styles.cursorColResize,
    'progress': styles.cursorProgress,
    'help': styles.cursorHelp,
    'context-menu': styles.cursorContextMenu,
  };

  const classes = [
    styles.cursor,
    variantClassMap[variant],
    step ? styles.stepOn : styles.stepOff,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props} />
  );
};
