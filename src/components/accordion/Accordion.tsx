import React from 'react';
import styles from './Accordion.module.scss';
import { N24OutlineOrders } from '../../icons/24-outline-orders';

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  opened: boolean;
  chevronPosition: 'left' | 'right';
  icon?: boolean;
  titleValue?: string;
  desc?: boolean;
  descValue?: string;
  contentValue?: React.ReactNode;
  text?: boolean;
  textValue?: string;
  swapContent?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
  opened,
  chevronPosition,
  icon = true,
  titleValue = '',
  desc = false,
  descValue = '',
  contentValue,
  text = true,
  textValue = 'Lorem ipsum dolor sit amet, consectetur ',
  swapContent = true,
  className,
  ...rest
}) => {
  return (
    <div
      className={`${styles.accordion} ${opened ? styles.opened : styles.closed} ${className || ''}`}
      {...rest}
    >
      <div className={styles.top}>
        {chevronPosition === 'left' && (
          <div className={styles.right}>
            <div className={`${styles.chevronContainer} ${styles.chevronLeft} ${opened ? styles.opened : styles.closed}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}
        <div className={styles.left}>
          {icon && <N24OutlineOrders />}
          <div className={styles.text}>
            {titleValue && <span>{titleValue}</span>}
            {desc && descValue && <span>{descValue}</span>}
          </div>
        </div>
        {chevronPosition === 'right' && (
          <div className={styles.right}>
            <div className={`${styles.chevronContainer} ${styles.chevronRight} ${opened ? styles.opened : styles.closed}`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        )}
      </div>
      {opened && (
        <div className={styles.bottom}>
          {text && textValue && <div className={styles.content}>{textValue}</div>}
          {swapContent && contentValue && <div>{contentValue}</div>}
        </div>
      )}
    </div>
  );
};
