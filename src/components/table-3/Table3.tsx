import React from 'react';
import styles from './Table3.module.css';

export interface Table3Props extends React.TableHTMLAttributes<HTMLTableElement> {
  variant?: 'default' | 'hover' | 'active';
  mode?: '1' | '2';
}

export const Table3: React.FC<Table3Props> = ({
  variant = 'default',
  mode = '1',
  className,
  children,
  ...props
}) => {
  const tableClasses = [
    styles.table,
    variant === 'hover' && styles.tableHover,
    variant === 'active' && styles.tableActive,
    mode === '1' && styles.tableMode1,
    mode === '2' && styles.tableMode2,
    className
  ].filter(Boolean).join(' ');

  return (
    <table className={tableClasses} {...props}>
      <thead className={styles.tableHeader}>
        <tr className={styles.tableRow}>
          <th className={`${styles.tableCell} ${styles.tableHeaderCell}`}>Header 1</th>
          <th className={`${styles.tableCell} ${styles.tableHeaderCell}`}>Header 2</th>
          <th className={`${styles.tableCell} ${styles.tableHeaderCell}`}>Header 3</th>
        </tr>
      </thead>
      <tbody>
        <tr className={styles.tableRow}>
          <td className={`${styles.tableCell} ${styles.tableDataCell}`}>Data 1</td>
          <td className={`${styles.tableCell} ${styles.tableDataCell}`}>Data 2</td>
          <td className={`${styles.tableCell} ${styles.tableDataCell}`}>Data 3</td>
        </tr>
        <tr className={styles.tableRow}>
          <td className={`${styles.tableCell} ${styles.tableDataCell}`}>Data 4</td>
          <td className={`${styles.tableCell} ${styles.tableDataCell}`}>Data 5</td>
          <td className={`${styles.tableCell} ${styles.tableDataCell}`}>Data 6</td>
        </tr>
        <tr className={`${styles.tableRow} ${styles.tableTotalRow}`}>
          <td className={`${styles.tableCell} ${styles.tableTotalCell}`}>Total</td>
          <td className={`${styles.tableCell} ${styles.tableTotalCell}`}></td>
          <td className={`${styles.tableCell} ${styles.tableTotalCell}`}>Sum</td>
        </tr>
      </tbody>
    </table>
  );
};
