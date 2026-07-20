import React from 'react';
import styles from './Component3.module.css';

export interface Component3Props extends React.HTMLAttributes<HTMLDivElement> {
  property1: 'мини';
}

export const Component3: React.FC<Component3Props> = ({
  property1,
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.autoservisy} ${styles.mini} ${className || ''}`.trim()}
      {...props}
    >
      Автосервисы
    </div>
  );
};
