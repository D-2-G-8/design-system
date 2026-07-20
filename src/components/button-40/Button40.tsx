import React from 'react';
import styles from './Button40.module.css';

export interface Button40Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type?: 'text' | 'regular';
}

export const Button40: React.FC<Button40Props> = ({
  type = 'regular',
  className,
  children,
  ...props
}) => {
  const typeClass = type === 'text' ? styles.buttonText : styles.buttonRegular;
  
  return (
    <button
      className={`${styles.button} ${typeClass} ${styles.buttonDefault} ${className || ''}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};
