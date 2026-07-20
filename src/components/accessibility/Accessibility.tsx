import React from 'react';
import styles from './Accessibility.module.css';

export interface AccessibilityProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Accessibility: React.FC<AccessibilityProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.accessibility}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
