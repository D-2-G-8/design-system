import React, { useState, useRef, forwardRef } from 'react';
import styles from './Inputphone.module.scss';
import { Tooltip } from '../tooltip';
import { OutlineRegularClose } from '../../icons/outline-regular-close';

export interface InputphoneProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange' | 'size'> {
  /**
   * Controlled phone number value; pass together with onChange to drive the input from the parent, or omit both to let the component manage its own internal state.
   */
  value?: string;
  /**
   * Initial phone number value when uncontrolled; ignored if `value` is provided.
   */
  defaultValue?: string;
  /**
   * Callback fired when the phone number changes, providing the new formatted value; use together with `value` for controlled mode or omit both for uncontrolled.
   */
  onChange?: (value: string) => void;
  /**
   * Text label displayed above the input field when labelOutside is true, or as a floating label inside the field when labelOutside is false and the input is empty; required for accessibility.
   */
  label?: string;
  /**
   * When true, the label is positioned above the input field as a separate element; when false (default), the label appears inside the field as a placeholder until the user focuses or fills the input.
   */
  labelOutside?: boolean;
  /**
   * Placeholder text shown inside the input when empty (default is the phone mask '+7 900 000-00-00'); only relevant when labelOutside is true or label is not provided.
   */
  placeholder?: string;
  /**
   * Optional helper text displayed below the input to provide additional context or instructions.
   */
  description?: string;
  /**
   * When true, applies error styling (red border, error icon) to indicate validation failure; typically paired with an error message in the description prop.
   */
  error?: boolean;
  /**
   * When true, the input is non-interactive and displays with a gray background; use for fields that cannot be edited in the current context.
   */
  disabled?: boolean;
  /**
   * When true, the input displays its value as plain text without a border or background (no interactive field chrome); use for display-only scenarios where the value should not be editable.
   */
  readOnly?: boolean;
  /**
   * When true and readOnly is also true, collapses the field height to just the text line (no padding or background), creating an ultra-compact read-only display.
   */
  readOnlyLowProfile?: boolean;
  /**
   * Visual size of the input: 'sm' renders a 40px tall field with 10px border radius and 14px horizontal padding; 'lg' (default) renders a 52px tall field with 12px radius and 16px padding.
   */
  size?: 'sm' | 'lg';
  /**
   * Placement of the optional tooltip icon and popover relative to the input field; only relevant when a tooltip is provided.
   */
  tooltipPlacement?: 'top' | 'right' | 'bottom';
  /**
   * Optional tooltip content displayed in a popover when the user hovers or clicks the info icon rendered alongside the input.
   */
  tooltipText?: string;
  /**
   * Callback fired when the user clicks the clear icon (X) shown in focus or error-focus states; if provided, the clear icon is rendered and clicking it invokes this callback (typically to reset the value to empty).
   */
  onClear?: () => void;
}

const formatPhoneNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  
  if (digits.length === 0) return '';
  if (digits.length <= 1) return `+${digits}`;
  
  let formatted = '+7';
  if (digits.length > 1) {
    formatted += ' ' + digits.substring(1, 4);
  }
  if (digits.length > 4) {
    formatted += ' ' + digits.substring(4, 7);
  }
  if (digits.length > 7) {
    formatted += '-' + digits.substring(7, 9);
  }
  if (digits.length > 9) {
    formatted += '-' + digits.substring(9, 11);
  }
  
  return formatted;
};

export const Inputphone = forwardRef<HTMLInputElement, InputphoneProps>(({
  value: controlledValue,
  defaultValue = '',
  onChange,
  label,
  labelOutside = false,
  placeholder = '+7 900 000-00-00',
  description,
  error = false,
  disabled = false,
  readOnly = false,
  readOnlyLowProfile = false,
  size = 'lg',
  tooltipPlacement = 'bottom',
  tooltipText,
  onClear,
  className,
  ...restProps
}, ref) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  React.useImperativeHandle(ref, () => inputRef.current!);

  const isControlled = controlledValue !== undefined;
  const effectiveValue = isControlled ? controlledValue : internalValue;
  const isFilled = effectiveValue.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    
    if (!isControlled) {
      setInternalValue(formatted);
    }
    
    onChange?.(formatted);
  };

  const handleClear = () => {
    const emptyValue = '';
    
    if (!isControlled) {
      setInternalValue(emptyValue);
    }
    
    onChange?.(emptyValue);
    onClear?.();
    inputRef.current?.focus();
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    restProps.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    restProps.onBlur?.(e);
  };

  const showClearIcon = isFocused && isFilled && !disabled && !readOnly;
  const showPlaceholder = !isFilled && (labelOutside || !label);

  const fieldClassName = [
    styles.field,
    size === 'sm' ? styles.fieldSm : styles.fieldLg,
    isFocused && !error && !disabled && !readOnly ? styles.fieldFocus : '',
    error && !isFocused && !disabled && !readOnly ? styles.fieldError : '',
    error && isFocused && !disabled && !readOnly ? styles.fieldErrorFocus : '',
    disabled ? styles.fieldDisabled : '',
    readOnly ? styles.fieldReadOnly : '',
    readOnly && readOnlyLowProfile ? styles.fieldReadOnlyLowProfile : '',
    !isFocused && !error && !disabled && !readOnly ? styles.fieldDefault : '',
  ].filter(Boolean).join(' ');

  const containerClassName = [
    styles.container,
    className
  ].filter(Boolean).join(' ');

  if (readOnly) {
    return (
      <div className={containerClassName}>
        {labelOutside && label && (
          <div className={styles.label}>
            <span className={styles.labelText}>{label}</span>
          </div>
        )}
        <div className={fieldClassName}>
          <div className={styles.value}>
            <span>{effectiveValue || placeholder}</span>
          </div>
        </div>
        {tooltipText && (
          <div className={styles.tooltipPortal}>
            <Tooltip text={tooltipText} placement={tooltipPlacement} resizable={false} />
          </div>
        )}
        {description && (
          <div className={styles.description}>
            <span>{description}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {labelOutside && label && (
        <div className={styles.label}>
          <span className={styles.labelText}>{label}</span>
        </div>
      )}
      <div className={fieldClassName}>
        <input
          ref={inputRef}
          type="tel"
          value={effectiveValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={isFocused && !isFilled ? '' : (showPlaceholder ? placeholder : '')}
          className={styles.input}
          {...restProps}
        />
        
        <div className={styles.inputDisplay}>
          {!labelOutside && !isFilled && !isFocused && label ? (
            <span className={styles.labelInside}>{label}</span>
          ) : isFocused && !isFilled ? (
            <>
              <span className={styles.value}>+7</span>
              <div className={styles.cursor}>
                <span />
              </div>
              <span className={styles.placeholderPart}>900 000-00-00</span>
            </>
          ) : isFilled && isFocused ? (
            <>
              <span className={styles.value}>{effectiveValue}</span>
              <div className={styles.cursor}>
                <span />
              </div>
            </>
          ) : isFilled ? (
            <span className={styles.value}>{effectiveValue}</span>
          ) : showPlaceholder ? (
            <span className={styles.placeholder}>{placeholder}</span>
          ) : null}
        </div>
        
        {showClearIcon && (
          <div className={styles.iconCont} onClick={handleClear}>
            <div className={styles.icon}>
              <OutlineRegularClose />
            </div>
          </div>
        )}
      </div>
      {tooltipText && (
        <div className={styles.tooltipPortal}>
          <Tooltip text={tooltipText} placement={tooltipPlacement} resizable={false} />
        </div>
      )}
      {description && (
        <div className={styles.description}>
          <span>{description}</span>
        </div>
      )}
    </div>
  );
});

Inputphone.displayName = 'Inputphone';