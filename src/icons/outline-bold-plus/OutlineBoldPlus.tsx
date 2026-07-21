import React from "react";
import styles from "./OutlineBoldPlus.module.scss";

export interface OutlineBoldPlusProps extends React.SVGProps<SVGSVGElement> {
  /** Width and height in px (icons are square). Defaults to 24. */
  size?: number | string;
}

/** Auto-generated from Figma -- the real exported SVG, colored via `currentColor`. */
export const OutlineBoldPlus: React.FC<OutlineBoldPlusProps> = ({ size = 24, className, ...props }) => (
  <svg
    className={[styles.icon, className].filter(Boolean).join(" ")}
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
      <path d="M24 5.5C22.6193 5.5 21.5 6.61929 21.5 8L21.5 21.5L8 21.5C6.61929 21.5 5.5 22.6193 5.5 24C5.5 25.3807 6.61929 26.5 8 26.5L21.5 26.5L21.5 40C21.5 41.3807 22.6193 42.5 24 42.5C25.3807 42.5 26.5 41.3807 26.5 40V26.5H40C41.3807 26.5 42.5 25.3807 42.5 24C42.5 22.6193 41.3807 21.5 40 21.5L26.5 21.5L26.5 8C26.5 6.61929 25.3807 5.5 24 5.5Z" fill="currentColor"/>
  </svg>
);
