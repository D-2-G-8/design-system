import React from 'react';
import styles from './KeyboardIphoneLayouts.module.css';

export interface KeyboardIphoneLayoutsProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'letters-lowercase';
}

export const KeyboardIphoneLayouts: React.FC<KeyboardIphoneLayoutsProps> = ({
  type,
  className,
  ...props
}) => {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  return (
    <div className={`${styles.keyboardContainer} ${className || ''}`} {...props}>
      <div className={styles.keyboard}>
        <div className={styles.keyRow}>
          {rows[0].map((letter) => (
            <button key={letter} className={`${styles.key} ${styles.keyLetter} ${styles.letterKey}`}>
              {letter}
            </button>
          ))}
        </div>
        <div className={styles.keyRow}>
          {rows[1].map((letter) => (
            <button key={letter} className={`${styles.key} ${styles.keyLetter} ${styles.letterKey}`}>
              {letter}
            </button>
          ))}
        </div>
        <div className={styles.keyRow}>
          <button className={`${styles.key} ${styles.keyShift} ${styles.functionKey} ${styles.wideKey}`}>
            ⇧
          </button>
          {rows[2].map((letter) => (
            <button key={letter} className={`${styles.key} ${styles.keyLetter} ${styles.letterKey}`}>
              {letter}
            </button>
          ))}
          <button className={`${styles.key} ${styles.keyBackspace} ${styles.functionKey} ${styles.wideKey}`}>
            ⌫
          </button>
        </div>
        <div className={styles.keyRow}>
          <button className={`${styles.key} ${styles.functionKey}`}>
            123
          </button>
          <button className={`${styles.key} ${styles.keySpace} ${styles.wideKey}`}>
            space
          </button>
          <button className={`${styles.key} ${styles.keyReturn} ${styles.functionKey}`}>
            return
          </button>
        </div>
      </div>
    </div>
  );
};
