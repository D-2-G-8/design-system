import React from 'react';
import styles from './Electricity.module.css';

export interface ElectricityProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Electricity: React.FC<ElectricityProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.electricity}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
