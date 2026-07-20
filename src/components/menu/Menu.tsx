import React from 'react';
import styles from './Menu.module.css';

export interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export interface MenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface MenuDividerProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface MenuGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  children?: React.ReactNode;
}

export const Menu = Object.assign(
  React.forwardRef<HTMLDivElement, MenuProps>(
    ({ children, className, ...props }, ref) => {
      return (
        <div
          ref={ref}
          className={`${styles.menu}${className ? ` ${className}` : ''}`}
          role="menu"
          {...props}
        >
          {children}
        </div>
      );
    }
  ),
  {
    Item: React.forwardRef<HTMLButtonElement, MenuItemProps>(
      ({ children, active, disabled, className, ...props }, ref) => {
        const classNames = [
          styles.menuItem,
          active && styles.menuItemActive,
          disabled && styles.menuItemDisabled,
          className
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <button
            ref={ref}
            className={classNames}
            role="menuitem"
            disabled={disabled}
            {...props}
          >
            {children}
          </button>
        );
      }
    ),
    Divider: React.forwardRef<HTMLDivElement, MenuDividerProps>(
      ({ className, ...props }, ref) => {
        return (
          <div
            ref={ref}
            className={`${styles.menuDivider}${className ? ` ${className}` : ''}`}
            role="separator"
            {...props}
          />
        );
      }
    ),
    Group: React.forwardRef<HTMLDivElement, MenuGroupProps>(
      ({ label, children, className, ...props }, ref) => {
        return (
          <div
            ref={ref}
            className={`${styles.menuGroup}${className ? ` ${className}` : ''}`}
            role="group"
            {...props}
          >
            {label && <div className={styles.menuGroupLabel}>{label}</div>}
            {children}
          </div>
        );
      }
    )
  }
);

Menu.displayName = 'Menu';
Menu.Item.displayName = 'Menu.Item';
Menu.Divider.displayName = 'Menu.Divider';
Menu.Group.displayName = 'Menu.Group';
