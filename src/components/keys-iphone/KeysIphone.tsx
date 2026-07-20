import React from 'react';
import styles from './KeysIphone.module.css';

export interface KeysIphoneProps extends React.HTMLAttributes<HTMLDivElement> {
  mode: 'light' | 'dark';
  type: 'lowercase' | 'uppercase';
  state: 'normal' | 'secondary' | 'emphasized';
}

export const KeysIphone: React.FC<KeysIphoneProps> = ({
  mode,
  type,
  state,
  className,
  ...props
}) => {
  const keyboardClasses = [
    styles.keyboard,
    styles[`key${mode.charAt(0).toUpperCase() + mode.slice(1)}` as keyof typeof styles],
    styles[`key${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof styles],
    className
  ].filter(Boolean).join(' ');

  const stateClass = styles[`key${state.charAt(0).toUpperCase() + state.slice(1)}` as keyof typeof styles];

  const row1Keys = type === 'lowercase' ? ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'] : ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
  const row2Keys = type === 'lowercase' ? ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'] : ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
  const row3Keys = type === 'lowercase' ? ['z', 'x', 'c', 'v', 'b', 'n', 'm'] : ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

  return (
    <div className={keyboardClasses} {...props}>
      <div className={styles.keyRow}>
        {row1Keys.map((letter) => (
          <button key={letter} className={`${styles.key} ${stateClass}`}>
            <span className={styles.keyLabel}>{letter}</span>
          </button>
        ))}
      </div>
      <div className={styles.keyRow}>
        {row2Keys.map((letter) => (
          <button key={letter} className={`${styles.key} ${stateClass}`}>
            <span className={styles.keyLabel}>{letter}</span>
          </button>
        ))}
      </div>
      <div className={styles.keyRow}>
        {row3Keys.map((letter) => (
          <button key={letter} className={`${styles.key} ${stateClass}`}>
            <span className={styles.keyLabel}>{letter}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
