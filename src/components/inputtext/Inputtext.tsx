import React, { useState, useRef, useEffect } from 'react';
import styles from './Inputtext.module.scss';
import { OutlineRegularClose } from '../../icons/outline-regular-close';
import { OutlineRegularCalendar } from '../../icons/outline-regular-calendar';
import { Tooltip } from '../tooltip';

export interface InputtextProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'value' | 'defaultValue'> {
  /**
   * Height of the input field in pixels; '52' for the larger variant or '40' for the compact variant.
   */
  size: '52' | '40';
  
  /**
   * Label text displayed above or inside the field depending on labelOutside; if omitted, no label is shown.
   */
  label?: string;
  
  /**
   * When true, label appears above the field; when false, label appears inside the field as a floating label; defaults to false.
   */
  labelOutside?: boolean;
  
  /**
   * Controlled value of the input; pass together with onChange to drive it from the parent, or omit both to let the component manage its own value as an uncontrolled input.
   */
  value?: string;
  
  /**
   * Initial value when uncontrolled; ignored if value is provided.
   */
  defaultValue?: string;
  
  /**
   * Callback fired on every input change with the new value; required for controlled usage, optional for uncontrolled.
   */
  onChange?: (value: string) => void;
  
  /**
   * Placeholder text shown when the field is empty and label is outside or no label is present.
   */
  placeholder?: string;
  
  /**
   * Helper or description text displayed below the field; if omitted, no description is shown.
   */
  description?: string;
  
  /**
   * When true, applies error styling (red border and error-colored description text); defaults to false.
   */
  error?: boolean;
  
  /**
   * When true, disables the input (gray background, no interaction); defaults to false.
   */
  disabled?: boolean;
  
  /**
   * When true, makes the input read-only (no border, no background fill, text-only display); defaults to false.
   */
  readOnly?: boolean;
  
  /**
   * When true and readOnly is also true, renders a minimal read-only variant with reduced height and no field container; ignored if readOnly is false.
   */
  readOnlyLowProfile?: boolean;
  
  /**
   * When true, displays a loading spinner icon in the icon container; defaults to false.
   */
  loading?: boolean;
  
  /**
   * Icon or component to display at the start of the icon container on the right side of the field; if omitted, no start icon is shown.
   */
  startIcon?: React.ReactNode;
  
  /**
   * Icon or component to display at the end of the icon container on the right side of the field; if omitted, no end icon is shown.
   */
  endIcon?: React.ReactNode;
  
  /**
   * Maximum number of characters allowed; when provided, a character count is displayed in the label row for size 40; if omitted, no character limit is enforced.
   */
  maxLength?: number;
  
  /**
   * Tooltip content to display; if omitted, no tooltip is shown.
   */
  tooltipText?: string;
  
  /**
   * Placement of the tooltip relative to the input field; defaults to 'bottom' if tooltipText is provided.
   */
  tooltipPlacement?: 'top' | 'bottom' | 'right';
}

export const Inputtext: React.FC<InputtextProps> = ({
  size,
  label,
  labelOutside = false,
  value,
  defaultValue,
  onChange,
  placeholder,
  description,
  error = false,
  disabled = false,
  readOnly = false,
  readOnlyLowProfile = false,
  loading = false,
  startIcon,
  endIcon,
  maxLength,
  tooltipText,
  tooltipPlacement = 'bottom',
  ...inputProps
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const [isFocused, setIsFocused] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const effectiveValue = value ?? internalValue;
  const isEmpty = !effectiveValue;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };
  
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setTooltipOpen(true);
    inputProps.onFocus?.(e);
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setTooltipOpen(false);
    inputProps.onBlur?.(e);
  };
  
  const fieldClassNames = [
    styles.field,
    size === '52' ? styles.fieldSize52 : styles.fieldSize40,
    disabled ? styles.fieldDisabled : 
    readOnly ? (readOnlyLowProfile ? styles.fieldReadOnlyLowProfile : styles.fieldReadOnly) :
    error && isFocused ? styles.fieldErrorFocus :
    error ? styles.fieldError :
    isFocused ? styles.fieldFocus :
    styles.fieldDefault
  ].filter(Boolean).join(' ');
  
  const showLabelInside = !labelOutside && isEmpty && label && !isFocused;
  const showPlaceholder = isEmpty && placeholder && (labelOutside || !label);
  
  const characterCount = effectiveValue.length;
  
  return (
    <div className={styles.container}>
      {labelOutside && (label || (maxLength && size === '40')) && (
        <div className={styles.labelRow}>
          {label && <span className={styles.labelText}>{label}</span>}
          {maxLength && size === '40' && (
            <span className={styles.characterCount}>{characterCount}</span>
          )}
        </div>
      )}
      
      <div className={fieldClassNames}>
        <div className={styles.valueContainer}>
          {showLabelInside ? (
            <span className={styles.labelInside}>{label}</span>
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={effectiveValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              readOnly={readOnly}
              placeholder={showPlaceholder ? placeholder : undefined}
              maxLength={maxLength}
              className={styles.valueText}
              aria-label={label}
              {...inputProps}
            />
          )}
        </div>
        
        {(loading || startIcon || endIcon) && (
          <div className={styles.iconContainer}>
            {loading && (
              <div className={styles.loaderIcon}>
                <div className={styles.lottie} />
              </div>
            )}
            {startIcon && <div className={styles.icon}>{startIcon}</div>}
            {endIcon && <div className={styles.icon}>{endIcon}</div>}
          </div>
        )}
      </div>
      
      {tooltipText && tooltipOpen && (
        <div className={styles.tooltipWrapper}>
          <Tooltip
            placement={tooltipPlacement}
            open={tooltipOpen}
            onOpenChange={setTooltipOpen}
          >
            {tooltipText}
          </Tooltip>
        </div>
      )}
      
      {description && (
        <div className={`${styles.descriptionText} ${error && !disabled ? styles.descriptionError : ''}`}>
          {description}
        </div>
      )}
    </div>
  );
};