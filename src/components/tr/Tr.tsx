import React from 'react';
import styles from './Tr.module.css';

export interface TrProps extends React.HTMLAttributes<HTMLTableRowElement> {
  variant?: 'default' | 'variant2' | 'variant3' | 'variant4';
  hover?: boolean;
  children?: React.ReactNode;
}

export const Tr: React.FC<TrProps> = ({
  variant = 'default',
  hover = false,
  className,
  children,
  ...props
}) => {
  const classNames = [
    styles.tr,
    styles[variant],
    hover && styles.hover,
    className
  ].filter(Boolean).join(' ');

  return (
    <tr className={classNames} {...props}>
      {children}
    </tr>
  );
};
