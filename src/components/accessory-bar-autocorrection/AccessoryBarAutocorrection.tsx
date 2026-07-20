import React from 'react';
import styles from './AccessoryBarAutocorrection.module.css';

export interface AccessoryBarAutocorrectionProps extends React.HTMLAttributes<HTMLDivElement> {
  selection: 1;
}

export const AccessoryBarAutocorrection: React.FC<AccessoryBarAutocorrectionProps> = ({
  selection,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.accessoryBar} ${className || ''}`} {...props}>
      <div className={styles.container}>
        <div className={`${styles.suggestionItem} ${styles.selectedItem}`}>
          <span className={styles.text}>I</span>
        </div>
        <div className={styles.suggestionItem}>
          <span className={styles.text}>"I"</span>
        </div>
        <div className={styles.suggestionItem}>
          <span className={styles.text}>"i"</span>
        </div>
      </div>
    </div>
  );
};
