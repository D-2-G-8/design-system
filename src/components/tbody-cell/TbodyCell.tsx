import React from 'react';
import styles from './TbodyCell.module.css';

export interface TbodyCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  type: 'rowControl' | 'stringFilled' | 'control' | 'linkString' | 'numberEmpty' | 'selectorStringFilled' | 'image' | 'numberFilled' | 'linkNumber' | 'visitedNumber' | 'visitedString' | 'tableHeader';
  children?: React.ReactNode;
}

export const TbodyCell: React.FC<TbodyCellProps> = ({
  type,
  className,
  children,
  ...props
}) => {
  const typeClassMap = {
    rowControl: styles.cellRowControl,
    stringFilled: styles.cellStringFilled,
    control: styles.cellControl,
    linkString: styles.cellLinkString,
    numberEmpty: styles.cellNumberEmpty,
    selectorStringFilled: styles.cellSelectorStringFilled,
    image: styles.cellImage,
    numberFilled: styles.cellNumberFilled,
    linkNumber: styles.cellLinkNumber,
    visitedNumber: styles.cellVisitedNumber,
    visitedString: styles.cellVisitedString,
    tableHeader: styles.cellTableHeader,
  };

  const cellClasses = [
    styles.cell,
    typeClassMap[type],
    className
  ].filter(Boolean).join(' ');

  return (
    <td className={cellClasses} {...props}>
      {children}
    </td>
  );
};
