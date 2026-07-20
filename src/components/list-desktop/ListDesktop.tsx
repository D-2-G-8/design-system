import React from 'react';
import styles from './ListDesktop.module.css';

export interface ListDesktopProps extends React.HTMLAttributes<HTMLDivElement> {
  size: 'L';
  items?: Array<{
    text: string;
    icon?: React.ReactNode;
  }>;
}

export const ListDesktop: React.FC<ListDesktopProps> = ({
  size,
  items = [],
  className,
  ...props
}) => {
  return (
    <div className={`${styles.listDesktop} ${className || ''}`} {...props}>
      <div className={styles.listContainer}>
        {items.map((item, index) => (
          <div key={index} className={styles.listItem}>
            <div className={styles.listItemContent}>
              {item.icon && (
                <span className={styles.listItemIcon}>{item.icon}</span>
              )}
              <span className={styles.listItemText}>{item.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
