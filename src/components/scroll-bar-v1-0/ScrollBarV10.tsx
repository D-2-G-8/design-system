import React from 'react';
import styles from './ScrollBarV10.module.css';

export interface ScrollBarV10Props extends React.HTMLAttributes<HTMLDivElement> {
  coordinate: 'x' | 'y';
}

export const ScrollBarV10: React.FC<ScrollBarV10Props> = ({
  coordinate,
  className,
  ...props
}) => {
  const scrollBarClass = coordinate === 'x' ? styles.scrollBarX : styles.scrollBarY;
  
  return (
    <div
      className={`${styles.scrollBar} ${scrollBarClass} ${className || ''}`.trim()}
      {...props}
    >
      <div className={styles.thumb} />
    </div>
  );
};
