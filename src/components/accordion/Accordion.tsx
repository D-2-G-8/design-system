import React from 'react';
import styles from './Accordion.module.scss';
import { 24OutlineOrders } from '../24-outline-orders';

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
  ...props
}) => {
  const chevronIcon = (
    <div className={styles.right}>
      <div className={styles.chevronContainer}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d={opened ? "M6 9l6 6 6-6" : "M9 6l6 6-6 6"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );

  return (
    <div
      className={`${styles.accordion} ${opened ? styles.opened : ''} ${
        chevronPosition === 'left' ? styles.chevronLeft : styles.chevronRight
      } ${className || ''}`}
      {...props}
    >
      <div className={styles.top}>
        {chevronPosition === 'left' && chevronIcon}
        <div className={styles.left}>
          {icon && <24OutlineOrders />}
          <div className={styles.text}>
            {titleValue && <span>{titleValue}</span>}
            {desc && descValue && <span>{descValue}</span>}
          </div>
        </div>
        {chevronPosition === 'right' && chevronIcon}
      </div>
      {opened && (
        <div className={styles.bottom}>
          {text && textValue && <div>{textValue}</div>}
          {swapContent && contentValue && <div>{contentValue}</div>}
        </div>
      )}
    </div>
  );
};
