import React from 'react';
import styles from './PulseEffect.module.css';

export interface PulseEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'variant2' | 'variant3';
}

export const PulseEffect: React.FC<PulseEffectProps> = ({
  variant = 'default',
  className,
  ...props
}) => {
  const variantClass = variant === 'default' 
    ? styles.variantDefault 
    : variant === 'variant2' 
    ? styles.variantVariant2 
    : styles.variantVariant3;

  return (
    <div 
      className={`${styles.pulseEffect} ${variantClass} ${className || ''}`.trim()}
      {...props}
    />
  );
};
