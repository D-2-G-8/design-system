import React from 'react';
import styles from './Chevrondown.module.css';

export interface ChevrondownProps extends React.SVGAttributes<SVGSVGElement> {
  type?: 'basic';
}

export function Chevrondown({ type = 'basic', className, ...props }: ChevrondownProps) {
  const iconClassName = type === 'basic' ? styles.iconBasic : '';
  const combinedClassName = [styles.chevronDown, iconClassName, className]
    .filter(Boolean)
    .join(' ');

  return (
    <svg
      className={combinedClassName}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
