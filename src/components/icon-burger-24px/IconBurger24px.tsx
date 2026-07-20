import React from 'react';
import styles from './IconBurger24px.module.css';

export interface IconBurger24pxProps extends React.SVGAttributes<SVGSVGElement> {}

export const IconBurger24px: React.FC<IconBurger24pxProps> = ({ className, ...props }) => {
  return (
    <svg
      className={`${styles.icon}${className ? ` ${className}` : ''}`}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M3 18H21V16H3V18ZM3 13H21V11H3V13ZM3 6V8H21V6H3Z"
        fill="currentColor"
      />
    </svg>
  );
};
