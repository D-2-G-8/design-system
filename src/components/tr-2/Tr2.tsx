import React from 'react';
import styles from './Tr2.module.css';

export interface Tr2Props extends React.HTMLAttributes<HTMLTableRowElement> {
  variant?: 'default' | 'variant2' | 'variant3';
}

export const Tr2: React.FC<Tr2Props> = ({
  variant = 'default',
  className,
  children,
  ...rest
}) => {
  return (
    <tr
      className={`${styles.tr} ${styles[variant]} ${className || ''}`.trim()}
      {...rest}
    >
      {children}
    </tr>
  );
};
