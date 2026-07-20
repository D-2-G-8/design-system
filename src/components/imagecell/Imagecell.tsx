import React from 'react';
import styles from './Imagecell.module.css';

export interface ImagecellProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isVisited: boolean;
}

export const Imagecell: React.FC<ImagecellProps> = ({
  isVisited,
  className,
  ...props
}) => {
  const combinedClassName = [
    styles.imageCell,
    isVisited && styles.imageCellVisited,
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a className={combinedClassName} {...props} />
  );
};
