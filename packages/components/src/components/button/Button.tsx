import React from 'react';
import styles from './Button.module.scss';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Height of the button in pixels, controlling padding, font size, and icon dimensions; defaults to '40px' for standard UI density. */
  size?: '24px' | '32px' | '40px' | '52px';
  /** Visual style variant controlling background and text colors; 'primary' is solid black, 'secondary' is light gray, 'tertiary' is transparent with hover states; defaults to 'primary'. */
  appearance?: 'primary' | 'secondary' | 'tertiary';
  /** When true, renders the button in a visually muted state and prevents interaction; defaults to false. */
  disabled?: boolean;
  /** Controlled toggle state for tertiary buttons only; when true, applies a toggled background color to indicate the button is in an active/selected state; ignored for primary and secondary appearances. */
  toggled?: boolean;
  /** Initial toggle state when uncontrolled; only applies to tertiary appearance buttons; ignored if 'toggled' is provided or if appearance is primary/secondary. */
  defaultToggled?: boolean;
  /** Callback fired when the toggle state changes in tertiary appearance buttons; receives the new toggled value; must be provided together with 'toggled' for controlled behavior, or omit both for uncontrolled behavior. */
  onToggledChange?: (toggled: boolean) => void;
  /** Button label text or content; typically a string but supports any renderable content including icons and badges. */
  children?: React.ReactNode;
  /** Optional secondary description text; only rendered for size='52px'; appears below the main button text with smaller, lighter styling. */
  description?: string;
  /** Optional icon or component rendered before the label; pass a design-system icon component instance. */
  startIcon?: React.ReactNode;
  /** Optional icon or component rendered after the label; pass a design-system icon component instance. */
  endIcon?: React.ReactNode;
  /** Optional badge component rendered at the end of the button; pass a BadgeCount component instance for count indicators. Badge size should match button size: use size="20px" for button size='52px', size="16px" for other sizes. */
  badge?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      size = '40px',
      appearance = 'primary',
      disabled = false,
      toggled: controlledToggled,
      defaultToggled = false,
      onToggledChange,
      children,
      description,
      startIcon,
      endIcon,
      badge,
      className,
      onClick,
      ...rest
    },
    ref
  ) => {
    const [toggledState, setToggledState] = React.useState(defaultToggled);
    const effectiveToggled = controlledToggled ?? toggledState;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (appearance === 'tertiary' && !disabled) {
        const nextToggled = !effectiveToggled;
        if (controlledToggled === undefined) {
          setToggledState(nextToggled);
        }
        onToggledChange?.(nextToggled);
      }
      onClick?.(e);
    };

    const sizeClass =
      size === '24px'
        ? styles.size24px
        : size === '32px'
        ? styles.size32px
        : size === '40px'
        ? styles.size40px
        : styles.size52px;

    const appearanceClass =
      appearance === 'primary'
        ? styles.appearancePrimary
        : appearance === 'secondary'
        ? styles.appearanceSecondary
        : styles.appearanceTertiary;

    const classNames = [
      styles.button,
      sizeClass,
      appearanceClass,
      disabled && styles.disabled,
      appearance === 'tertiary' && effectiveToggled && styles.toggled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const labelClass = [
      styles.label,
      size === '52px' && description && styles.labelWithDescription,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled}
        onClick={handleClick}
        {...rest}
      >
        {startIcon && <span className={styles.startIcon}>{startIcon}</span>}
        {children && (
          <span className={labelClass}>
            <span className={styles.labelText}>{children}</span>
            {size === '52px' && description && (
              <span className={styles.description}>{description}</span>
            )}
          </span>
        )}
        {endIcon && <span className={styles.endIcon}>{endIcon}</span>}
        {badge && <span className={styles.badge}>{badge}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';