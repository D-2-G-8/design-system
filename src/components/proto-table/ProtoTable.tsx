import React from 'react';
import styles from './ProtoTable.module.css';

export interface ProtoTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  variant: 'default' | 'hover';
}

export const ProtoTable: React.FC<ProtoTableProps> = ({ 
  variant, 
  className,
  children,
  ...rest 
}) => {
  return (
    <table 
      className={`${styles.table} ${className || ''}`}
      {...rest}
    >
      <thead className={styles.tableHeader}>
        <tr className={styles.tableRow}>
          <th className={styles.tableCell}>Item</th>
          <th className={styles.tableCell}>Quantity</th>
          <th className={styles.tableCell}>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr className={variant === 'hover' ? styles.tableRowHover : styles.tableRow}>
          <td className={styles.tableCell}>Product A</td>
          <td className={styles.tableCell}>2</td>
          <td className={styles.tableCell}>$20.00</td>
        </tr>
        <tr className={styles.tableRow}>
          <td className={styles.tableCell}>Product B</td>
          <td className={styles.tableCell}>1</td>
          <td className={styles.tableCell}>$15.00</td>
        </tr>
        <tr className={styles.tableRow}>
          <td className={styles.tableCell}>Product C</td>
          <td className={styles.tableCell}>3</td>
          <td className={styles.tableCell}>$45.00</td>
        </tr>
      </tbody>
      <tfoot>
        <tr className={styles.tableTotal}>
          <td className={styles.tableCell}>Total</td>
          <td className={styles.tableCell}>6</td>
          <td className={styles.tableCell}>$80.00</td>
        </tr>
      </tfoot>
    </table>
  );
};
