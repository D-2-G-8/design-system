import React from 'react';
import styles from './HeaderCollV10.module.css';

export interface HeaderCollV10Props extends React.HTMLAttributes<HTMLDivElement> {
  align: 'left' | 'center' | 'right';
  isHovered: boolean;
}

export const HeaderCollV10: React.FC<HeaderCollV10Props> = ({
  align,
  isHovered,
  className,
  ...props
}) => {
  const alignClass = align === 'left' 
    ? styles.headerLeft 
    : align === 'center' 
    ? styles.headerCenter 
    : styles.headerRight;

  const headerClasses = [
    styles.header,
    alignClass,
    isHovered ? styles.headerHovered : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={headerClasses} {...props}>
      <div className={styles.content}>
        <div className={styles.icon} />
        <div className={styles.text}>Header</div>
      </div>
    </div>
  );
};
