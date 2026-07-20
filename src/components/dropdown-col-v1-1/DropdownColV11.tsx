import React, { ButtonHTMLAttributes, useState, useRef, useEffect } from 'react';
import styles from './DropdownColV11.module.css';

export interface DropdownColV11Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  presets: boolean;
  filterByValue: boolean;
  state: 'default' | 'filter' | 'preset';
  label?: string;
  value?: string;
  options?: string[];
  presetOptions?: string[];
  onSelect?: (value: string) => void;
  onFilterChange?: (value: string) => void;
}

export const DropdownColV11: React.FC<DropdownColV11Props> = ({
  presets,
  filterByValue,
  state,
  label = 'Select option',
  value = '',
  options = ['Option 1', 'Option 2', 'Option 3'],
  presetOptions = ['Preset 1', 'Preset 2', 'Preset 3'],
  onSelect,
  onFilterChange,
  disabled,
  className,
  ...buttonProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (selectedValue: string) => {
    onSelect?.(selectedValue);
    setIsOpen(false);
    setFilterValue('');
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFilterValue(newValue);
    onFilterChange?.(newValue);
  };

  const getTriggerClassName = () => {
    switch (state) {
      case 'filter':
        return styles.triggerFilter;
      case 'preset':
        return styles.triggerPreset;
      default:
        return styles.triggerDefault;
    }
  };

  const filteredOptions = filterByValue && filterValue
    ? options.filter(option => option.toLowerCase().includes(filterValue.toLowerCase()))
    : options;

  return (
    <div
      ref={dropdownRef}
      className={`${styles.dropdown} ${isOpen ? styles.dropdownOpen : ''} ${disabled ? styles.dropdownDisabled : ''} ${className || ''}`}
    >
      <button
        type="button"
        className={`${styles.trigger} ${getTriggerClassName()}`}
        onClick={handleToggle}
        disabled={disabled}
        {...buttonProps}
      >
        <div className={styles.content}>
          {label && <span className={styles.label}>{label}</span>}
          {value && <span className={styles.value}>{value}</span>}
        </div>
        <span className={`${styles.icon} ${isOpen ? styles.iconRotated : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className={`${styles.menu} ${styles.menuOpen}`}>
          {filterByValue && state === 'filter' && (
            <>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="Filter..."
                value={filterValue}
                onChange={handleFilterChange}
                autoFocus
              />
              <div className={styles.separator} />
            </>
          )}

          {presets && state === 'preset' && presetOptions.length > 0 && (
            <>
              <div className={styles.presetList}>
                {presetOptions.map((preset, index) => (
                  <div
                    key={`preset-${index}`}
                    className={styles.presetItem}
                    onClick={() => handleSelect(preset)}
                  >
                    {preset}
                  </div>
                ))}
              </div>
              <div className={styles.separator} />
            </>
          )}

          {filteredOptions.map((option, index) => (
            <div
              key={`option-${index}`}
              className={`${styles.menuItem} ${activeIndex === index ? styles.menuItemActive : ''}`}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
