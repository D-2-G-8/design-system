import React from 'react';
import styles from './Background.module.css';

export interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: 'light' | 'dark';
  style?: 'default';
  type?: 'default';
}

export const Background: React.FC<BackgroundProps> = ({
  mode,
  style: styleVariant = 'default',
  type = 'default',
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.background} ${styles[mode]} ${styles[styleVariant]} ${className || ''}`.trim()}
      {...props}
    />
  );
};
