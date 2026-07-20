import React from 'react';
import styles from './ArrowDown01Round.module.css';

export interface ArrowDown01RoundProps extends React.SVGAttributes<SVGSVGElement> {}

export const ArrowDown01Round: React.FC<ArrowDown01RoundProps> = (props) => {
  const { className, ...rest } = props;
  
  return (
    <svg
      className={`${styles.icon} ${className || ''}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <path
        d="M12 5V19M12 19L19 12M12 19L5 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
