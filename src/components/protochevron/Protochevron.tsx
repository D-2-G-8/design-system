import React from 'react';
import styles from './Protochevron.module.css';

export interface ProtochevronProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'default' | 'variant2' | 'variant3';
}

export function Protochevron({ variant, className, ...props }: ProtochevronProps) {
  const variantClass = variant === 'variant2' 
    ? styles.chevronVariant2 
    : variant === 'variant3' 
    ? styles.chevronVariant3 
    : styles.chevronDefault;

  return (
    <div 
      className={`${styles.chevron} ${variantClass} ${className || ''}`.trim()} 
      {...props} 
    />
  );
}
