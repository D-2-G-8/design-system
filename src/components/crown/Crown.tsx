import React from "react";
import styles from "./Crown.module.css";

export interface CrownProps extends React.SVGAttributes<SVGSVGElement> {}

export const Crown: React.FC<CrownProps> = ({ className, ...props }) => {
  return (
    <svg
      className={`${styles.crown}${className ? ` ${className}` : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 2L15 8L21 7L18 13H6L3 7L9 8L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 13L5 22H19L18 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
