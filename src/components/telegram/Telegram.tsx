import React from 'react';
import styles from './Telegram.module.css';

export interface TelegramProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Telegram: React.FC<TelegramProps> = ({ className, ...props }) => {
  return (
    <div className={`${styles.telegram} ${className || ''}`.trim()} {...props}>
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.67-.52.36-.99.53-1.42.52-.47-.01-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.24.37-.49 1.02-.74 4-1.74 6.68-2.88 8.03-3.44 3.82-1.59 4.61-1.87 5.13-1.87.11 0 .37.03.54.17.14.11.18.26.2.37.01.08.03.29.01.44z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
