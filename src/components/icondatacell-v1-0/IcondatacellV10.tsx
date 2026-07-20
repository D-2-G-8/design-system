import React from 'react';
import styles from './IcondatacellV10.module.css';

export interface IcondatacellV10Props extends React.HTMLAttributes<HTMLDivElement> {
  link: boolean;
  visited: boolean;
}

export const IcondatacellV10: React.FC<IcondatacellV10Props> = ({
  link,
  visited,
  className,
  ...props
}) => {
  const classNames = [
    styles.iconDataCell,
    styles.default,
    link && styles.link,
    visited && styles.visited,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames} {...props} />
  );
};
