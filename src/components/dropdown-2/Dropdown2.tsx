import React, { useState, useRef, useEffect } from 'react';
import styles from './Dropdown2.module.css';

export interface Dropdown2Props extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  appearance?: 'primary';
  size?: 'medium' | 'large';
  theme?: 'light';
  device?: 'mobile';
  state?: 'passive' | 'focused';
  isEmpty?: boolean;
  hasTooltip?: boolean;
  value?: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  onChange?: (value: string) => void;
  label?: string;
}

export const Dropdown2: React.FC<Dropdown2Props> = ({
  appearance = 'primary',
  size = 'medium',
  theme = 'light',
  device = 'mobile',
  state = 'passive',
  isEmpty = true,
  hasTooltip = false,
  value = '',
  placeholder = 'Select an option',
  options = [],
  onChange,
  label,
  className,
  ...rest
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(state === 'focused');
  const [selectedValue, setSelectedValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  const effectiveIsEmpty = isEmpty && !selectedValue;

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    setIsFocused(state === 'focused');
  }, [state]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setIsFocused(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    setIsFocused(false);
    if (onChange) {
      onChange(optionValue);
    }
  };

  const selectedOption = options.find(opt => opt.value === selectedValue);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const dropdownClasses = [
    styles.dropdown,
    size === 'large' ? styles.dropdownLarge : styles.dropdownMedium,
    appearance === 'primary' ? styles.dropdownPrimary : '',
    theme === 'light' ? styles.dropdownLight : '',
    device === 'mobile' ? styles.dropdownMobile : '',
    isFocused ? styles.dropdownFocused : styles.dropdownPassive,
    effectiveIsEmpty ? styles.dropdownEmpty : styles.dropdownWithValue,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.container} ref={containerRef} {...rest}>
      {label && <div className={styles.label}>{label}</div>}
      <div className={dropdownClasses} onClick={handleToggle}>
        <div className={styles.input}>
          {displayValue}
        </div>
        <div className={styles.iconWrapper}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      {isOpen && options.length > 0 && (
        <div className={styles.listWrapper}>
          {options.map((option) => (
            <div
              key={option.value}
              className={styles.listItem}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
