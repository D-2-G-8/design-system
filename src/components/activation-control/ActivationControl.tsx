import React from 'react';
import styles from './ActivationControl.module.css';

export interface ActivationControlProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const ActivationControl: React.FC<ActivationControlProps> = ({
  label,
  checked = false,
  onCheckedChange,
  onChange,
  className,
  ...props
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.target.checked);
  };

  return (
    <div className={`${styles.activationControl} ${className || ''}`}>
      <div className={styles.container}>
        {label && <span className={styles.label}>{label}</span>}
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            {...props}
          />
          <span className={styles.slider}></span>
        </label>
      </div>
    </div>
  );
};
