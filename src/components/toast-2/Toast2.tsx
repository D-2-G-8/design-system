import React from 'react';
import styles from './Toast2.module.css';

export interface Toast2Props extends React.HTMLAttributes<HTMLDivElement> {
  size: 'm' | 'l';
  appearance: 'default' | 'negative' | 'positive';
  button: boolean;
  desc: boolean;
}

export const Toast2: React.FC<Toast2Props> = ({
  size,
  appearance,
  button,
  desc,
  className,
  ...props
}) => {
  const toastClasses = [
    styles.toast,
    size === 'm' ? styles.toastSizeM : styles.toastSizeL,
    appearance === 'default' && styles.toastAppearanceDefault,
    appearance === 'negative' && styles.toastAppearanceNegative,
    appearance === 'positive' && styles.toastAppearancePositive,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={toastClasses} {...props}>
      <div className={styles.toastIcon} />
      <div className={styles.toastContent}>
        <div className={styles.toastTitle}>Toast Title</div>
        {desc && <div className={styles.toastDescription}>Toast description text goes here</div>}
      </div>
      {button && <button className={styles.toastButton}>Action</button>}
    </div>
  );
};
