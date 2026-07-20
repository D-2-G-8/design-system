import React from 'react';
import styles from './SeResize.module.css';

export interface SeResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const SeResize: React.FC<SeResizeProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.seResize}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
