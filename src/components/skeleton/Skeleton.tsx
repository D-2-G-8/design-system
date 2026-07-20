import React from 'react';
import styles from './Skeleton.module.css';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  view: 'text' | 'component';
  lines: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  view,
  lines,
  className,
  ...props
}) => {
  const skeletonClassName = `${styles.skeleton} ${
    view === 'text' ? styles.skeletonText : styles.skeletonComponent
  } ${className || ''}`.trim();

  if (view === 'component') {
    return <div className={skeletonClassName} {...props} />;
  }

  return (
    <div className={skeletonClassName} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className={styles.skeletonLine} />
      ))}
    </div>
  );
};
