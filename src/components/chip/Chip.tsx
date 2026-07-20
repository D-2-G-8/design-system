import React from 'react';
import styles from './Chip.module.css';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size: '32' | '40';
  type: 'default' | 'menu' | 'editable';
  appearance: 'default';
  active: boolean;
  children?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  size,
  type,
  appearance,
  active,
  children,
  className,
  ...rest
}) => {
  const sizeClass = size === '32' ? styles.size32 : styles.size40;
  const typeClass = 
    type === 'menu' ? styles.typeMenu :
    type === 'editable' ? styles.typeEditable :
    styles.typeDefault;
  const appearanceClass = styles.appearanceDefault;
  const activeClass = active ? styles.active : styles.inactive;

  return (
    <button
      className={`${styles.chip} ${sizeClass} ${typeClass} ${appearanceClass} ${activeClass} ${className || ''}`}
      {...rest}
    >
      <span className={styles.label}>{children}</span>
    </button>
  );
};
