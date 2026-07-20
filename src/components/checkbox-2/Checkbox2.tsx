import React from 'react';
import styles from './Checkbox2.module.css';

export interface Checkbox2Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  size: 16;
  checked: boolean;
  indeterminate: boolean;
}

export const Checkbox2: React.FC<Checkbox2Props> = ({
  size,
  checked,
  indeterminate,
  disabled,
  className,
  ...props
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const checkboxClasses = [
    styles.checkbox,
    size === 16 && styles.checkboxSize16,
    checked && styles.checkboxChecked,
    indeterminate && styles.checkboxIndeterminate,
    disabled && styles.checkboxDisabled,
    className
  ].filter(Boolean).join(' ');

  return (
    <label className={checkboxClasses}>
      <input
        ref={inputRef}
        type="checkbox"
        className={styles.checkboxInput}
        checked={checked}
        disabled={disabled}
        {...props}
      />
      <span className={styles.checkboxBox}>
        <span className={styles.checkboxIcon} />
      </span>
    </label>
  );
};
