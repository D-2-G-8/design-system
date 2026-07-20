import React from 'react';
import styles from './Breadcrumbs.module.css';

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: Array<{ label: string; href?: string }>;
  separator?: React.ReactNode;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  separator = '/',
  className,
  ...props
}) => {
  return (
    <nav
      className={`${styles.breadcrumbs}${className ? ` ${className}` : ''}`}
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className={styles.breadcrumbsList}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className={styles.breadcrumbItem}>
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className={`${styles.breadcrumbLink} ${styles.breadcrumbLinkHover}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={isLast ? styles.breadcrumbLinkActive : styles.breadcrumbText}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className={styles.breadcrumbSeparator} aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
