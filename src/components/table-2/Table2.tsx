import React from 'react';
import styles from './Table2.module.css';

export interface Table2Props extends React.TableHTMLAttributes<HTMLTableElement> {
  caption?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const Table2: React.FC<Table2Props> = ({
  caption = false,
  showHeader = false,
  showFooter = false,
  className,
  ...props
}) => {
  return (
    <table className={`${styles.table}${className ? ` ${className}` : ''}`} {...props}>
      {caption && (
        <caption className={styles.caption}>Table Caption</caption>
      )}
      {showHeader && (
        <thead className={styles.thead}>
          <tr className={styles.row}>
            <th className={styles.headerCell}>Header 1</th>
            <th className={styles.headerCell}>Header 2</th>
            <th className={styles.headerCell}>Header 3</th>
          </tr>
        </thead>
      )}
      <tbody className={styles.tbody}>
        <tr className={styles.row}>
          <td className={styles.cell}>Cell 1</td>
          <td className={styles.cell}>Cell 2</td>
          <td className={styles.cell}>Cell 3</td>
        </tr>
        <tr className={styles.row}>
          <td className={styles.cell}>Cell 4</td>
          <td className={styles.cell}>Cell 5</td>
          <td className={styles.cell}>Cell 6</td>
        </tr>
        <tr className={styles.row}>
          <td className={styles.cell}>Cell 7</td>
          <td className={styles.cell}>Cell 8</td>
          <td className={styles.cell}>Cell 9</td>
        </tr>
      </tbody>
      {showFooter && (
        <tfoot className={styles.tfoot}>
          <tr className={styles.row}>
            <td className={styles.footerCell}>Footer 1</td>
            <td className={styles.footerCell}>Footer 2</td>
            <td className={styles.footerCell}>Footer 3</td>
          </tr>
        </tfoot>
      )}
    </table>
  );
};
