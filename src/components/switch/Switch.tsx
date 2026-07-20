import React from 'react';
import styles from './Switch.module.css';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  product: 'b2c' | 'b2b';
  type: 'radio' | 'checkbox';
  size: 's' | 'm' | 'l';
  active: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  product,
  type,
  size,
  active,
  className,
  ...rest
}) => {
  const productClass = product === 'b2c' ? styles.switchB2c : styles.switchB2b;
  const typeClass = type === 'radio' ? styles.switchRadio : styles.switchCheckbox;
  const sizeClass = size === 's' ? styles.switchSmall : size === 'm' ? styles.switchMedium : styles.switchLarge;
  const activeClass = active ? styles.switchActive : styles.switchInactive;

  return (
    <label className={`${styles.switch} ${productClass} ${typeClass} ${sizeClass} ${activeClass} ${className || ''}`}>
      <input
        type={type}
        checked={active}
        className={styles.switchInput}
        {...rest}
      />
      <span className={styles.switchTrack}>
        <span className={styles.switchThumb} />
      </span>
      <span className={styles.switchToggle} />
    </label>
  );
};
