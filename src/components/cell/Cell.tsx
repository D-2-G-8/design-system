import React from 'react';
import styles from './Cell.module.css';

export interface CellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  type: 'header' | 'default';
  theme: 'light';
  size: 's' | 'm';
}

export const Cell: React.FC<CellProps> = ({
  type,
  theme,
  size,
  className,
  children,
  ...restProps
}) => {
  const Component = type === 'header' ? 'th' : 'td';
  
  const classNames = [
    styles.cell,
    type === 'header' ? styles.cellHeader : styles.cellDefault,
    theme === 'light' ? styles.themeLight : '',
    size === 's' ? styles.sizeS : styles.sizeM,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Component className={classNames} {...restProps}>
      {children}
    </Component>
  );
};
