import React, { useState } from 'react';
import styles from './CrossFilterAndSorting.module.css';

export interface CrossFilterAndSortingProps extends React.HTMLAttributes<HTMLDivElement> {
  hasSort: boolean;
  hasSearch: boolean;
  hasRange: boolean;
  hasVariants: boolean;
  isSearchFilled: boolean;
  isCheckedPreview: boolean;
  isReopened: boolean;
  hasNoResults: boolean;
}

export const CrossFilterAndSorting: React.FC<CrossFilterAndSortingProps> = ({
  hasSort,
  hasSearch,
  hasRange,
  hasVariants,
  isSearchFilled,
  isCheckedPreview,
  isReopened,
  hasNoResults,
  className,
  ...props
}) => {
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(isSearchFilled ? 'Search query' : '');
  const [rangeValues, setRangeValues] = useState({ min: '', max: '' });
  const [checkedVariants, setCheckedVariants] = useState<Set<string>>(new Set());

  const handleSortClick = () => {
    setSortDropdownOpen(!sortDropdownOpen);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchValue('');
  };

  const handleVariantToggle = (variantId: string) => {
    const newChecked = new Set(checkedVariants);
    if (newChecked.has(variantId)) {
      newChecked.delete(variantId);
    } else {
      newChecked.add(variantId);
    }
    setCheckedVariants(newChecked);
  };

  const handleReset = () => {
    setSearchValue('');
    setRangeValues({ min: '', max: '' });
    setCheckedVariants(new Set());
  };

  const containerClasses = [
    styles.container,
    className
  ].filter(Boolean).join(' ');

  const filterPanelClasses = [
    styles.filterPanel,
    isReopened && styles.filterPanelReopened
  ].filter(Boolean).join(' ');

  const sortButtonClasses = [
    styles.sortButton,
    (sortDropdownOpen || isCheckedPreview) && styles.sortButtonActive
  ].filter(Boolean).join(' ');

  const searchInputClasses = [
    styles.searchInput,
    isSearchFilled && styles.searchInputFilled
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      {hasSort && (
        <div style={{ position: 'relative' }}>
          <button 
            className={sortButtonClasses}
            onClick={handleSortClick}
            type="button"
          >
            Sort
          </button>
          {sortDropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownItem}>
                <span>Name A-Z</span>
              </div>
              <div className={styles.dropdownItem}>
                <span>Name Z-A</span>
              </div>
              <div className={styles.dropdownItem}>
                <span>Price Low-High</span>
              </div>
              <div className={styles.dropdownItem}>
                <span>Price High-Low</span>
              </div>
            </div>
          )}
        </div>
      )}

      {hasSearch && (
        <div style={{ position: 'relative' }}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={searchInputClasses}
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearchChange}
          />
          {isSearchFilled && searchValue && (
            <button 
              className={styles.clearIcon}
              onClick={handleClearSearch}
              type="button"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {isCheckedPreview && (
        <div className={styles.checkedPreview}>
          <span className={styles.checkedCount}>
            {checkedVariants.size} filters applied
          </span>
        </div>
      )}

      <div className={filterPanelClasses}>
        {hasRange && (
          <div className={styles.rangeFilter}>
            <label className={styles.rangeLabel}>Price Range</label>
            <div className={styles.divider} />
            <input
              type="number"
              className={styles.rangeInput}
              placeholder="Min"
              value={rangeValues.min}
              onChange={(e) => setRangeValues({ ...rangeValues, min: e.target.value })}
            />
            <input
              type="number"
              className={styles.rangeInput}
              placeholder="Max"
              value={rangeValues.max}
              onChange={(e) => setRangeValues({ ...rangeValues, max: e.target.value })}
            />
          </div>
        )}

        {hasVariants && (
          <div className={styles.variantList}>
            {['Color', 'Size', 'Material', 'Brand'].map((variant) => (
              <div key={variant} className={styles.variantItem}>
                <input
                  type="checkbox"
                  className={styles.variantCheckbox}
                  id={`variant-${variant}`}
                  checked={checkedVariants.has(variant)}
                  onChange={() => handleVariantToggle(variant)}
                />
                <label 
                  className={styles.variantLabel}
                  htmlFor={`variant-${variant}`}
                >
                  {variant}
                </label>
              </div>
            ))}
          </div>
        )}

        {(hasRange || hasVariants) && (
          <>
            <button className={styles.applyButton} type="button">
              Apply Filters
            </button>
            <button 
              className={styles.resetButton} 
              type="button"
              onClick={handleReset}
            >
              Reset
            </button>
          </>
        )}
      </div>

      {hasNoResults && (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>🔍</div>
          <p className={styles.noResultsText}>
            No results found
          </p>
        </div>
      )}
    </div>
  );
};
