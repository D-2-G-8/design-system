import React from 'react';
import styles from './Icon.module.css';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  children?: React.ReactNode;
}

export const Icon: React.FC<IconProps> = ({ children, className, ...props }) => {
  return (
    <svg
      className={`${styles.icon}${className ? ` ${className}` : ''}`}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
};
