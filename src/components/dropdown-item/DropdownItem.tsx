import React from 'react';
import styles from './DropdownItem.module.css';

export interface DropdownItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  size: 's' | 'm';
  selected: boolean;
  labelMedium: boolean;
  disabled: boolean;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  size,
  selected,
  labelMedium,
  disabled,
  className,
  children,
  ...props
}) => {
  const classNames = [
    styles.dropdownItem,
    size === 's' ? styles.sizeS : styles.sizeM,
    selected && styles.selected,
    labelMedium && styles.labelMedium,
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  return (
    <li
      className={classNames}
      aria-selected={selected}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </li>
  );
};
