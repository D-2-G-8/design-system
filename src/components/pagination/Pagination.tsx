import React from 'react';
import styles from './Pagination.module.css';

export interface PaginationProps {
  position: 'beginning' | 'middle' | 'end';
}

export const Pagination: React.FC<PaginationProps> = ({ position }) => {
  const renderPageNumbers = () => {
    if (position === 'beginning') {
      return (
        <>
          <li className={styles.paginationItem}>
            <button className={`${styles.paginationLink} ${styles.paginationLinkActive}`}>
              1
            </button>
          </li>
          <li className={styles.paginationItem}>
            <button className={styles.paginationLink}>2</button>
          </li>
          <li className={styles.paginationItem}>
            <button className={styles.paginationLink}>3</button>
          </li>
          <li className={styles.paginationItem}>
            <span className={styles.paginationEllipsis}>...</span>
          </li>
          <li className={styles.paginationItem}>
            <button className={styles.paginationLink}>10</button>
          </li>
        </>
      );
    }

    if (position === 'middle') {
      return (
        <>
          <li className={styles.paginationItem}>
            <button className={styles.paginationLink}>1</button>
          </li>
          <li className={styles.paginationItem}>
            <span className={styles.paginationEllipsis}>...</span>
          </li>
          <li className={styles.paginationItem}>
            <button className={styles.paginationLink}>4</button>
          </li>
          <li className={styles.paginationItem}>
            <button className={`${styles.paginationLink} ${styles.paginationLinkActive}`}>
              5
            </button>
          </li>
          <li className={styles.paginationItem}>
            <button className={styles.paginationLink}>6</button>
          </li>
          <li className={styles.paginationItem}>
            <span className={styles.paginationEllipsis}>...</span>
          </li>
          <li className={styles.paginationItem}>
            <button className={styles.paginationLink}>10</button>
          </li>
        </>
      );
    }

    return (
      <>
        <li className={styles.paginationItem}>
          <button className={styles.paginationLink}>1</button>
        </li>
        <li className={styles.paginationItem}>
          <span className={styles.paginationEllipsis}>...</span>
        </li>
        <li className={styles.paginationItem}>
          <button className={styles.paginationLink}>8</button>
        </li>
        <li className={styles.paginationItem}>
          <button className={styles.paginationLink}>9</button>
        </li>
        <li className={styles.paginationItem}>
          <button className={`${styles.paginationLink} ${styles.paginationLinkActive}`}>
            10
          </button>
        </li>
      </>
    );
  };

  const isPrevDisabled = position === 'beginning';
  const isNextDisabled = position === 'end';

  return (
    <nav className={styles.pagination}>
      <ul className={styles.paginationList}>
        <li className={styles.paginationItem}>
          <button
            className={`${styles.paginationLink} ${styles.paginationArrow} ${styles.paginationArrowPrev} ${
              isPrevDisabled ? styles.paginationLinkDisabled : ''
            }`}
            disabled={isPrevDisabled}
            aria-label="Previous page"
          >
            ←
          </button>
        </li>
        {renderPageNumbers()}
        <li className={styles.paginationItem}>
          <button
            className={`${styles.paginationLink} ${styles.paginationArrow} ${styles.paginationArrowNext} ${
              isNextDisabled ? styles.paginationLinkDisabled : ''
            }`}
            disabled={isNextDisabled}
            aria-label="Next page"
          >
            →
          </button>
        </li>
      </ul>
    </nav>
  );
};
