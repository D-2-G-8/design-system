import React from 'react';
import styles from './X.module.css';

export interface XProps extends React.SVGAttributes<SVGSVGElement> {
  type?: 'basic';
}

export const X: React.FC<XProps> = ({
  type = 'basic',
  className,
  ...props
}) => {
  const svgClassName = `${styles.x} ${type === 'basic' ? styles.iconBasic : ''} ${className || ''}`.trim();

  return (
    <svg
      className={svgClassName}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
