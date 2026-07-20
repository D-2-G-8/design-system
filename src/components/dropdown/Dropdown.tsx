import React, { useState, useRef, useEffect } from 'react';
import styles from './Dropdown.module.css';

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  size: 's' | 'm';
  type: 'custom' | 'list';
  theme: 'light';
  label?: string;
  items?: Array<{ label: string; value: string; onClick?: () => void }>;
  customContent?: React.ReactNode;
}

export const Dropdown: React.FC<DropdownProps> = ({
  size,
  type,
  theme,
  label = 'Select',
  items = [],
  customContent,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item: { label: string; value: string; onClick?: () => void }) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const dropdownClasses = [
    styles.dropdown,
    size === 's' ? styles.dropdownS : styles.dropdownM,
    type === 'custom' ? styles.dropdownCustom : styles.dropdownList,
    styles.dropdownLight,
    className
  ].filter(Boolean).join(' ');

  const triggerClasses = [
    styles.trigger,
    size === 's' ? styles.triggerS : styles.triggerM
  ].join(' ');

  const menuClasses = [
    styles.menu,
    type === 'list' ? styles.menuList : styles.menuCustom
  ].join(' ');

  return (
    <div ref={dropdownRef} className={dropdownClasses} {...props}>
      <button
        type="button"
        className={triggerClasses}
        onClick={toggleDropdown}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className={styles.label}>{label}</span>
        <span className={styles.arrow}>
          <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className={menuClasses}>
          {type === 'list' && items.map((item, index) => {
            const itemClasses = [
              styles.menuItem,
              index === activeIndex ? styles.menuItemHover : ''
            ].filter(Boolean).join(' ');

            return (
              <div
                key={item.value}
                className={itemClasses}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(-1)}
                role="menuitem"
              >
                {item.label}
              </div>
            );
          })}
          {type === 'custom' && customContent}
        </div>
      )}
    </div>
  );
};
