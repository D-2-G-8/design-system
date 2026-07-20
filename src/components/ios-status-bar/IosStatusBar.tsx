import React from 'react';
import styles from './IosStatusBar.module.css';

export interface IosStatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  device: 'X';
  cardStack: 'off';
}

export const IosStatusBar: React.FC<IosStatusBarProps> = ({
  device,
  cardStack,
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.statusBar} ${styles.statusBarX} ${styles.statusBarCardStackOff} ${className || ''}`}
      {...props}
    >
      <div className={styles.timeDisplay}>9:41</div>
      <div className={styles.notchArea} />
      <div className={styles.signalIndicators}>
        <span className={styles.carrierText} />
        <span className={styles.batteryIndicator} />
      </div>
    </div>
  );
};
