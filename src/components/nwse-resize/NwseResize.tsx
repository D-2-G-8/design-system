import React from 'react';
import styles from './NwseResize.module.css';

export interface NwseResizeProps extends React.HTMLAttributes<HTMLDivElement> {}

export const NwseResize: React.FC<NwseResizeProps> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={`${styles.nwseResize}${className ? ` ${className}` : ''}`}
      {...props}
    />
  );
};
