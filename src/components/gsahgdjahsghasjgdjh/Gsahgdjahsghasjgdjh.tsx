import React from 'react';
import styles from './Gsahgdjahsghasjgdjh.module.css';

export interface GsahgdjahsghasjgdjhProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Gsahgdjahsghasjgdjh: React.FC<GsahgdjahsghasjgdjhProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.gsahgdjahsghasjgdjh}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
