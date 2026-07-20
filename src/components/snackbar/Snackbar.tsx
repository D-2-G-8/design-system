import React from 'react';
import styles from './Snackbar.module.css';

export interface SnackbarProps extends React.HTMLAttributes<HTMLDivElement> {
  state: 'message' | 'error' | 'done' | 'info' | 'warning';
  theme: 'light' | 'dark';
  appearance: 'desktop' | 'mobile';
  subtitle?: string;
  icon?: 'left' | 'none';
  message: string;
}

export const Snackbar: React.FC<SnackbarProps> = ({
  state,
  theme,
  appearance,
  subtitle,
  icon = 'none',
  message,
  className,
  ...rest
}) => {
  const stateClass = {
    message: styles.stateMessage,
    error: styles.stateError,
    done: styles.stateDone,
    info: styles.stateInfo,
    warning: styles.stateWarning,
  }[state];

  const themeClass = theme === 'light' ? styles.snackbarLight : styles.snackbarDark;
  const appearanceClass = appearance === 'desktop' ? styles.snackbarDesktop : styles.snackbarMobile;

  const renderIcon = () => {
    if (icon === 'none') return null;

    return (
      <div className={`${styles.icon} ${styles.iconLeft}`}>
        {state === 'error' && '❌'}
        {state === 'done' && '✅'}
        {state === 'info' && 'ℹ️'}
        {state === 'warning' && '⚠️'}
        {state === 'message' && '💬'}
      </div>
    );
  };

  return (
    <div
      className={`${styles.snackbar} ${themeClass} ${appearanceClass} ${stateClass} ${className || ''}`.trim()}
      {...rest}
    >
      {icon === 'left' && renderIcon()}
      <div>
        <div className={styles.message}>{message}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
};
