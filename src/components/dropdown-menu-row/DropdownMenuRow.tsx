import React from 'react';
import styles from './DropdownMenuRow.module.css';

export interface DropdownMenuRowProps extends React.HTMLAttributes<HTMLDivElement> {
  content: 'string' | 'checkbox-string' | 'icon-string' | 'string-icon' | 'icon-string-icon' | 'icon-option';
  label: string;
  icon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  checked?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const DropdownMenuRow: React.FC<DropdownMenuRowProps> = ({
  content,
  label,
  icon,
  trailingIcon,
  checked = false,
  disabled = false,
  onClick,
  className,
  ...rest
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      if (onClick) {
        onClick();
      }
    }
  };

  const rowClasses = [
    styles.row,
    disabled && styles.disabled,
    !disabled && styles.hover,
    className
  ].filter(Boolean).join(' ');

  const renderContent = () => {
    switch (content) {
      case 'string':
        return (
          <div className={styles.rowContent}>
            <span className={styles.label}>{label}</span>
          </div>
        );

      case 'checkbox-string':
        return (
          <div className={styles.rowContent}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={checked}
                disabled={disabled}
                onChange={() => {}}
                tabIndex={-1}
              />
              <span className={styles.checkboxLabel}>{label}</span>
            </label>
          </div>
        );

      case 'icon-string':
        return (
          <div className={styles.rowContent}>
            {icon && <span className={styles.iconLeft}>{icon}</span>}
            <span className={styles.label}>{label}</span>
          </div>
        );

      case 'string-icon':
        return (
          <div className={styles.rowContent}>
            <span className={styles.label}>{label}</span>
            {trailingIcon && <span className={styles.iconRight}>{trailingIcon}</span>}
          </div>
        );

      case 'icon-string-icon':
        return (
          <div className={styles.rowContent}>
            {icon && <span className={styles.iconLeft}>{icon}</span>}
            <span className={styles.label}>{label}</span>
            {trailingIcon && <span className={styles.iconRight}>{trailingIcon}</span>}
          </div>
        );

      case 'icon-option':
        return (
          <div className={styles.rowContent}>
            {icon && <span className={styles.iconLeft}>{icon}</span>}
            <span className={styles.label}>{label}</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={rowClasses}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      {...rest}
    >
      {renderContent()}
    </div>
  );
};
