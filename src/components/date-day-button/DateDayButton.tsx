import React from 'react';
import styles from './DateDayButton.module.css';

export interface DateDayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean;
  interval: 'start' | 'between' | 'end' | null;
  isNextMonth: boolean;
}

export const DateDayButton: React.FC<DateDayButtonProps> = ({
  checked,
  interval,
  isNextMonth,
  className,
  disabled,
  ...props
}) => {
  const classNames = [
    styles.dateDayButton,
    checked && styles.checked,
    interval === 'start' && styles.intervalStart,
    interval === 'between' && styles.intervalBetween,
    interval === 'end' && styles.intervalEnd,
    isNextMonth && styles.nextMonth,
    disabled && styles.disabled,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classNames}
      disabled={disabled}
      {...props}
    />
  );
};
