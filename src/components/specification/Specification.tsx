import React from 'react';
import styles from './Specification.module.css';

export interface SpecificationProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Specification: React.FC<SpecificationProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.specification}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
