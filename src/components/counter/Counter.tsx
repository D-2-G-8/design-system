import React from 'react';
import styles from './Counter.module.css';

export interface CounterProps extends React.HTMLAttributes<HTMLDivElement> {
  theme: 'light' | 'dark';
  size: 's' | 'm' | 'l';
  max: boolean;
  value?: number;
  label?: string;
}

export const Counter: React.FC<CounterProps> = ({
  theme,
  size,
  max,
  value = 0,
  label,
  className,
  ...rest
}) => {
  const themeClass = theme === 'light' ? styles.counterLight : styles.counterDark;
  const sizeClass = size === 's' ? styles.counterSizeS : size === 'm' ? styles.counterSizeM : styles.counterSizeL;
  const maxClass = max ? styles.counterMax : '';

  return (
    <div
      className={`${styles.counter} ${themeClass} ${sizeClass} ${maxClass} ${className || ''}`.trim()}
      {...rest}
    >
      <span className={styles.counterValue}>{value}</span>
      {label && <span className={styles.counterLabel}>{label}</span>}
    </div>
  );
};
