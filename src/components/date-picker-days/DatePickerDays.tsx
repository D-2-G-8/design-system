import React from 'react';
import styles from './DatePickerDays.module.css';

export interface DatePickerDaysProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  isCurrent?: boolean;
  isActive?: boolean;
  isEmpty?: boolean;
}

export const DatePickerDays: React.FC<DatePickerDaysProps> = ({
  disabled = false,
  isCurrent = false,
  isActive = false,
  isEmpty = false,
  className,
  children,
  ...props
}) => {
  const classNames = [
    styles.day,
    disabled && styles.dayDisabled,
    isCurrent && styles.dayCurrent,
    isActive && styles.dayActive,
    isEmpty && styles.dayEmpty,
    styles.dayHover,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classNames}
      disabled={disabled || isEmpty}
      aria-current={isCurrent ? 'date' : undefined}
      aria-pressed={isActive ? 'true' : undefined}
      {...props}
    >
      {!isEmpty && children}
    </button>
  );
};
