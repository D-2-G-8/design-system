import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'children'> {
  appearance?: 'default';
  filled?: boolean;
  labelOutside?: boolean;
  error?: boolean;
  disabled?: boolean;
  label?: string;
  errorMessage?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      appearance = 'default',
      filled = false,
      labelOutside = false,
      error = false,
      disabled = false,
      label,
      errorMessage,
      className,
      ...rest
    },
    ref
  ) => {
    const textareaClasses = [
      styles.textarea,
      filled && styles.textareaFilled,
      error && styles.textareaError,
      disabled && styles.textareaDisabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const labelClasses = [
      styles.label,
      labelOutside ? styles.labelOutside : styles.labelInside,
    ]
      .filter(Boolean)
      .join(' ');

    const textareaElement = (
      <textarea
        ref={ref}
        className={textareaClasses}
        disabled={disabled}
        aria-invalid={error}
        {...rest}
      />
    );

    if (!label && !errorMessage) {
      return textareaElement;
    }

    return (
      <div className={styles.container}>
        {label && labelOutside && (
          <label className={labelClasses}>{label}</label>
        )}
        <div className={styles.textareaWrapper}>
          {label && !labelOutside && (
            <label className={labelClasses}>{label}</label>
          )}
          {textareaElement}
        </div>
        {error && errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
