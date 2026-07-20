import React from 'react';
import styles from './TfootCell.module.css';

export interface TfootCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  type: 'rowControl' | 'tableHeader' | 'numberFille';
  children?: React.ReactNode;
}

export const TfootCell: React.FC<TfootCellProps> = ({
  type,
  children,
  className,
  ...rest
}) => {
  const classNames = [
    styles.tfootCell,
    styles[type],
    className
  ].filter(Boolean).join(' ');

  return (
    <td className={classNames} {...rest}>
      <div className={styles.cellContent}>
        {children}
      </div>
    </td>
  );
};
