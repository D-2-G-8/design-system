import React, { forwardRef, InputHTMLAttributes, useState } from 'react';
import styles from './Inputtext2.module.css';

export interface Inputtext2Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: '40px';
  filled?: boolean;
  labelOutside?: boolean;
  label?: string;
  error?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Inputtext2 = forwardRef<HTMLInputElement, Inputtext2Props>(
  (
    {
      size = '40px',
      filled = false,
      labelOutside = false,
      label,
      error = false,
      iconLeft,
      iconRight,
      disabled = false,
      className,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    const inputTextClasses = [
      styles.inputText,
      size === '40px' && styles.size40,
      filled && styles.filled,
      disabled && styles.disabled,
      error && styles.error,
      focused && styles.focused,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputWrapperClasses = [
      styles.inputWrapper,
      iconLeft && styles.iconLeft,
      iconRight && styles.iconRight,
    ]
      .filter(Boolean)
      .join(' ');

    const labelClasses = [
      styles.label,
      labelOutside && styles.labelOutside,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={inputTextClasses}>
        {label && labelOutside && (
          <label className={labelClasses}>{label}</label>
        )}
        <div className={inputWrapperClasses}>
          {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
          <input
            ref={ref}
            className={styles.input}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          {label && !labelOutside && (
            <label className={labelClasses}>{label}</label>
          )}
          {iconRight && <span className={styles.icon}>{iconRight}</span>}
        </div>
      </div>
    );
  }
);

Inputtext2.displayName = 'Inputtext2';
