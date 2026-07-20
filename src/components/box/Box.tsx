import React from 'react';
import styles from './Box.module.css';

export interface BoxProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ className, ...props }, ref) => {
    const classes = [styles.box, className].filter(Boolean).join(' ');
    
    return <div ref={ref} className={classes} {...props} />;
  }
);

Box.displayName = 'Box';
