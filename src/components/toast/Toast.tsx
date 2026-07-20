import React from 'react';
import styles from './Toast.module.css';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  state: 'message' | 'error' | 'done' | 'info' | 'warning';
  theme: 'light' | 'dark';
  appearance: 'desktop' | 'mobile';
  subtitle?: string;
  icon: 'left' | 'none';
  message: string;
}

export const Toast: React.FC<ToastProps> = ({
  state,
  theme,
  appearance,
  subtitle,
  icon,
  message,
  className,
  ...rest
}) => {
  const toastClasses = [
    styles.toast,
    appearance === 'desktop' ? styles.toastDesktop : styles.toastMobile,
    theme === 'light' ? styles.toastLight : styles.toastDark,
    state === 'message' && styles.toastMessage,
    state === 'error' && styles.toastError,
    state === 'done' && styles.toastDone,
    state === 'info' && styles.toastInfo,
    state === 'warning' && styles.toastWarning,
    className
  ].filter(Boolean).join(' ');

  const iconClasses = [
    styles.iconContainer,
    icon === 'left' ? styles.iconLeft : styles.iconNone
  ].filter(Boolean).join(' ');

  const getIconContent = () => {
    if (icon === 'none') return null;

    switch (state) {
      case 'error':
        return '✕';
      case 'done':
        return '✓';
      case 'info':
        return 'i';
      case 'warning':
        return '⚠';
      case 'message':
      default:
        return '●';
    }
  };

  return (
    <div className={toastClasses} {...rest}>
      {icon === 'left' && (
        <div className={iconClasses}>
          {getIconContent()}
        </div>
      )}
      <div className={styles.content}>
        <div className={styles.title}>{message}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
    </div>
  );
};
