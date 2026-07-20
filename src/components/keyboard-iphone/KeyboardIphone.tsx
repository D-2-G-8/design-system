import React from 'react';
import styles from './KeyboardIphone.module.css';

export interface KeyboardIphoneProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'default';
}

export const KeyboardIphone: React.FC<KeyboardIphoneProps> = ({
  type = 'default',
  className,
  ...props
}) => {
  const row1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  return (
    <div className={`${styles.keyboard} ${className || ''}`} {...props}>
      <div className={styles.keyRow}>
        {row1.map((letter) => (
          <button key={letter} className={styles.key}>
            <span className={styles.keyLabel}>{letter}</span>
          </button>
        ))}
      </div>
      <div className={styles.keyRow}>
        {row2.map((letter) => (
          <button key={letter} className={styles.key}>
            <span className={styles.keyLabel}>{letter}</span>
          </button>
        ))}
      </div>
      <div className={styles.keyRow}>
        <button className={`${styles.key} ${styles.shiftKey} ${styles.functionKey}`}>
          <span className={styles.keyLabel}>⇧</span>
        </button>
        {row3.map((letter) => (
          <button key={letter} className={styles.key}>
            <span className={styles.keyLabel}>{letter}</span>
          </button>
        ))}
        <button className={`${styles.key} ${styles.deleteKey} ${styles.functionKey}`}>
          <span className={styles.keyLabel}>⌫</span>
        </button>
      </div>
      <div className={styles.keyRow}>
        <button className={`${styles.key} ${styles.functionKey}`}>
          <span className={styles.keyLabel}>123</span>
        </button>
        <button className={`${styles.key} ${styles.spaceBar}`}>
          <span className={styles.keyLabel}>space</span>
        </button>
        <button className={`${styles.key} ${styles.returnKey} ${styles.functionKey}`}>
          <span className={styles.keyLabel}>return</span>
        </button>
      </div>
    </div>
  );
};
