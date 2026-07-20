import React from 'react';
import styles from './SwapMe.module.css';

export interface SwapMeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SwapMe: React.FC<SwapMeProps> = ({ className, ...props }) => {
  return (
    <div className={`${styles.swapMe}${className ? ` ${className}` : ''}`} {...props} />
  );
};
