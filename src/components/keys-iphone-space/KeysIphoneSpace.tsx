import React from 'react';
import styles from './KeysIphoneSpace.module.css';

export interface KeysIphoneSpaceProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  config?: 'default';
}

export const KeysIphoneSpace: React.FC<KeysIphoneSpaceProps> = ({
  config = 'default',
  className,
  ...props
}) => {
  return (
    <button
      className={`${styles.spaceKey} ${className || ''}`}
      {...props}
    >
      <div className={styles.keyContainer}>
        <div className={styles.keyBackground} />
        <div className={styles.keyLabel}>space</div>
      </div>
    </button>
  );
};
