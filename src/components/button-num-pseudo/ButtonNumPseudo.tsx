import React from 'react';
import styles from './ButtonNumPseudo.module.css';

export interface ButtonNumPseudoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

export const ButtonNumPseudo: React.FC<ButtonNumPseudoProps> = ({
  active,
  className,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles.buttonDefault} ${active ? styles.buttonActive : styles.buttonInactive} ${className || ''}`}
      {...props}
    />
  );
};
