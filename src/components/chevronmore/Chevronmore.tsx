import React from 'react';
import styles from './Chevronmore.module.css';

export interface ChevronmoreProps extends React.HTMLAttributes<HTMLDivElement> {
  state: 'open' | 'close' | 'none' | 'included';
}

export const Chevronmore: React.FC<ChevronmoreProps> = ({
  state,
  className,
  ...props
}) => {
  const stateClass = {
    open: styles.stateOpen,
    close: styles.stateClose,
    none: styles.stateNone,
    included: styles.stateIncluded,
  }[state];

  return (
    <div
      className={`${styles.chevronMore} ${stateClass} ${className || ''}`.trim()}
      {...props}
    />
  );
};
