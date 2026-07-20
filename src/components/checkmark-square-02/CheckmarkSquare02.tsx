import React from 'react';
import styles from './CheckmarkSquare02.module.css';

export interface CheckmarkSquare02Props extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  disabled?: boolean;
}

export function CheckmarkSquare02({
  checked = false,
  disabled = false,
  className,
  ...props
}: CheckmarkSquare02Props) {
  return (
    <label
      className={`${styles.checkmarkSquare} ${checked ? styles.checked : styles.unchecked} ${
        disabled ? styles.disabled : ''
      } ${styles.hover} ${className || ''}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        {...props}
      />
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        {checked && (
          <path
            d="M9 12L11 14L15 10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </label>
  );
}
