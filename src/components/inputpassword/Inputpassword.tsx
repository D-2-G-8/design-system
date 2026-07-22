import React from 'react';
import styles from './Inputpassword.module.scss';
import { OutlineRegularClose } from '../../icons/outline-regular-close';
import { OutlineRegularView } from '../../icons/outline-regular-view';
import { OutlineRegularViewoff } from '../../icons/outline-regular-viewoff';
import { FillDone } from '../../icons/fill-done';
import { Tooltip } from '../tooltip';

export interface InputPasswordProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'onChange' | 'value' | 'defaultValue'> {
  /**
   * Visual size of the input field; 'sm' corresponds to 40px height with 10px border radius and 14px horizontal padding, 'lg' corresponds to 52px height with 12px border radius and 16px horizontal padding, defaults to 'lg' if omitted.
   */
  size?: 'sm' | 'lg';
  
  /**
   * Controlled value of the password input; pass together with onChange to drive it from the parent, or omit both to let the component manage its own value as an uncontrolled input.
   */
  value?: string;
  
  /**
   * Initial value when uncontrolled; ignored if value prop is provided, allowing the component to seed its internal state without parent control.
   */
  defaultValue?: string;
  
  /**
   * Callback fired on every input change with the new value; use together with value prop for controlled behavior, or omit for uncontrolled usage.
   */
  onChange?: (value: string) => void;
  
  /**
   * Placeholder text shown when the input is empty; displayed in a muted color (#b8b8b8) and hidden once the user starts typing.
   */
  placeholder?: string;
  
  /**
   * Label text displayed above or inside the input field depending on labelOutside prop; omit to render the input without any label.
   */
  label?: string;
  
  /**
   * Whether the label appears outside (above) the input field; true renders the label as a separate row above the field, false embeds it within the field container, defaults to true if omitted.
   */
  labelOutside?: boolean;
  
  /**
   * Descriptive helper text displayed below the input field; provides additional context or instructions to the user, omit to render without description.
   */
  description?: string;
  
  /**
   * Whether the input is in an error state; true applies error styling (orange #ff5d2a border) and shows an error icon, defaults to false if omitted.
   */
  error?: boolean;
  
  /**
   * Whether the input is in a success state; true applies success styling and shows a success icon (fill-done), ignored if error is true, defaults to false if omitted.
   */
  success?: boolean;
  
  /**
   * Whether the input is disabled; true prevents user interaction, applies disabled styling (gray background #f5f5f5, muted text #757575), and hides interactive icons, defaults to false if omitted.
   */
  disabled?: boolean;
  
  /**
   * Controlled visibility state of the password; true reveals the password in plain text with a 'view-off' icon, false masks it with bullets and shows a 'view' icon, pass together with onShowPasswordChange to control from parent or omit both for component-managed state.
   */
  showPassword?: boolean;
  
  /**
   * Initial password visibility when uncontrolled; ignored if showPassword prop is provided, defaults to false (password masked) if omitted.
   */
  defaultShowPassword?: boolean;
  
  /**
   * Callback fired when the user toggles password visibility via the view/view-off icon; use together with showPassword prop for controlled behavior, or omit for uncontrolled usage.
   */
  onShowPasswordChange?: (showPassword: boolean) => void;
  
  /**
   * Callback fired when the user clicks the clear icon (outline-regular-close); the component displays this icon only when the input has a value and this callback is provided, allowing the parent to handle clearing logic.
   */
  onClear?: () => void;
  
  /**
   * Text content for an optional tooltip displayed near the input; omit to render without any tooltip, the tooltip placement is configurable via tooltipPlacement prop.
   */
  tooltipText?: string;
  
  /**
   * Placement of the tooltip relative to the input field; only applies when tooltipText is provided, defaults to 'bottom' if omitted.
   */
  tooltipPlacement?: 'top' | 'bottom' | 'right';
}

export const Inputpassword: React.FC<InputPasswordProps> = ({
  size = 'lg',
  value,
  defaultValue = '',
  onChange,
  placeholder,
  label,
  labelOutside = true,
  description,
  error = false,
  success = false,
  disabled = false,
  showPassword,
  defaultShowPassword = false,
  onShowPasswordChange,
  onClear,
  tooltipText,
  tooltipPlacement = 'bottom',
  ...inputProps
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const [internalShowPassword, setInternalShowPassword] = React.useState(defaultShowPassword);
  const [isFocused, setIsFocused] = React.useState(false);
  const [tooltipOpen, setTooltipOpen] = React.useState(false);

  const effectiveValue = value ?? internalValue;
  const effectiveShowPassword = showPassword ?? internalShowPassword;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleToggleShowPassword = () => {
    if (disabled) return;
    const nextShowPassword = !effectiveShowPassword;
    if (showPassword === undefined) {
      setInternalShowPassword(nextShowPassword);
    }
    onShowPasswordChange?.(nextShowPassword);
  };

  const handleClear = () => {
    if (disabled) return;
    const newValue = '';
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
    onClear?.();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const fieldWrapperClasses = [
    styles.fieldWrapper,
    size === 'lg' ? styles.fieldWrapperSizeLg : styles.fieldWrapperSizeSm,
    error && isFocused && styles.fieldWrapperErrorFocus,
    error && !isFocused && styles.fieldWrapperError,
    !error && success && styles.fieldWrapperSuccess,
    !error && isFocused && styles.fieldWrapperFocus,
    disabled && styles.fieldWrapperDisabled,
  ].filter(Boolean).join(' ');

  const hasValue = effectiveValue.length > 0;

  const placementMap: Record<string, 'top' | 'bottom' | 'right'> = {
    top: 'top',
    bottom: 'bottom',
    right: 'right',
  };

  const fieldContent = (
    <>
      <div className={styles.valueContainer}>
        {label && !labelOutside && (
          <span className={styles.labelText}>{label}</span>
        )}
        {!hasValue && isFocused && (
          <>
            <div className={styles.cursor} />
            {placeholder && <div className={styles.placeholderText}>{placeholder}</div>}
          </>
        )}
        {!hasValue && !isFocused && placeholder && (
          <div className={styles.placeholderText}>{placeholder}</div>
        )}
        {hasValue && (
          <>
            <span className={disabled ? styles.valueTextDisabled : styles.valueText}>
              {effectiveShowPassword ? effectiveValue : '•'.repeat(effectiveValue.length)}
            </span>
            {isFocused && <div className={styles.cursor} />}
          </>
        )}
        <input
          {...inputProps}
          type={effectiveShowPassword ? 'text' : 'password'}
          value={effectiveValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={styles.hiddenInput}
        />
      </div>
      <div className={styles.iconContainer}>
        {hasValue && !disabled && !success && (
          <div className={styles.iconWrapper}>
            <div 
              className={styles.icon} 
              onClick={handleClear}
              style={{ cursor: 'pointer' }}
            >
              <OutlineRegularClose />
            </div>
          </div>
        )}
        {success && (
          <div className={styles.iconWrapper}>
            <div className={styles.icon}>
              <FillDone />
            </div>
          </div>
        )}
        {!success && (
          <div className={styles.iconWrapper}>
            <div 
              className={styles.icon} 
              onClick={handleToggleShowPassword}
              style={{ cursor: disabled ? 'default' : 'pointer', pointerEvents: disabled ? 'none' : 'auto' }}
            >
              {effectiveShowPassword ? <OutlineRegularViewoff /> : <OutlineRegularView />}
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className={styles.container}>
      {label && labelOutside && (
        <div className={styles.labelRow}>
          <span className={styles.labelText}>{label}</span>
        </div>
      )}
      
      <div 
        className={fieldWrapperClasses}
        onMouseEnter={() => tooltipText && setTooltipOpen(true)}
        onMouseLeave={() => tooltipText && setTooltipOpen(false)}
      >
        {fieldContent}
        {tooltipText && (
          <Tooltip
            placement={placementMap[tooltipPlacement]}
            open={tooltipOpen}
            onOpenChange={setTooltipOpen}
          >
            {tooltipText}
          </Tooltip>
        )}
      </div>

      {description && (
        <div className={styles.descriptionRow}>
          <span className={styles.descriptionText}>{description}</span>
        </div>
      )}
    </div>
  );
};