import React from 'react';
import styles from './StatusIndicator.module.css';

export interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  size: 'xs';
  appearance: 'negative' | 'positive' | 'warning' | 'active' | 'passive';
  type: 'status1' | 'status2' | 'status3';
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  size,
  appearance,
  type,
  className,
  ...props
}) => {
  const sizeClass = size === 'xs' ? styles.sizeXs : '';
  
  const appearanceClass = {
    negative: styles.appearanceNegative,
    positive: styles.appearancePositive,
    warning: styles.appearanceWarning,
    active: styles.appearanceActive,
    passive: styles.appearancePassive,
  }[appearance];
  
  const typeClass = {
    status1: styles.typeStatus1,
    status2: styles.typeStatus2,
    status3: styles.typeStatus3,
  }[type];
  
  const combinedClassName = [
    styles.statusIndicator,
    sizeClass,
    appearanceClass,
    typeClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  
  return <div className={combinedClassName} {...props} />;
};
