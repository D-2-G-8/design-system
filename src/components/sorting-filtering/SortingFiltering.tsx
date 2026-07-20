import React from 'react';
import styles from './SortingFiltering.module.css';

export interface SortingFilteringProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  type: 'sorting-filtering' | 'chevron' | 'sorting' | 'filtering';
  direction: 'ascend' | 'descend' | 'not';
  state: 'default' | 'hover' | 'active';
}

export const SortingFiltering: React.FC<SortingFilteringProps> = ({
  type,
  direction,
  state,
  className,
  ...props
}) => {
  const typeClass = type === 'sorting-filtering' ? styles.sortingFiltering :
                    type === 'chevron' ? styles.chevron :
                    type === 'sorting' ? styles.sorting :
                    styles.filtering;

  const directionClass = direction === 'ascend' ? styles.ascend :
                         direction === 'descend' ? styles.descend :
                         styles.not;

  const stateClass = state === 'default' ? styles.default :
                     state === 'hover' ? styles.hover :
                     styles.active;

  return (
    <button
      className={`${typeClass} ${directionClass} ${stateClass} ${styles.container} ${className || ''}`}
      {...props}
    >
      <span className={styles.icon} />
      <span className={styles.text} />
    </button>
  );
};
