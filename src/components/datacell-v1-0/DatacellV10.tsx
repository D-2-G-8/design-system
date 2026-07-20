import React from 'react';
import styles from './DatacellV10.module.css';

export interface DatacellV10Props extends React.HTMLAttributes<HTMLDivElement> {
  type: 'string' | 'select';
  align: 'left' | 'center' | 'right';
  hasMultipleValues: boolean;
}

export const DatacellV10: React.FC<DatacellV10Props> = ({
  type,
  align,
  hasMultipleValues,
  className,
  children,
  ...props
}) => {
  const alignClass = align === 'left' ? styles.alignLeft : align === 'center' ? styles.alignCenter : styles.alignRight;
  const typeClass = type === 'string' ? styles.typeString : styles.typeSelect;
  const valueClass = hasMultipleValues ? styles.multipleValues : styles.singleValue;

  return (
    <div
      className={`${styles.dataCell} ${alignClass} ${typeClass} ${valueClass} ${className || ''}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};
