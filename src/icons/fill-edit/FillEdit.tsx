import React from "react";
import styles from "./FillEdit.module.scss";

export interface FillEditProps extends React.SVGProps<SVGSVGElement> {
  /** Width and height in px (icons are square). Defaults to 24. */
  size?: number | string;
}

/** Auto-generated from Figma -- the real exported SVG, colored via `currentColor`. */
export const FillEdit: React.FC<FillEditProps> = ({ size = 24, className, ...props }) => (
  <svg
    className={[styles.icon, className].filter(Boolean).join(" ")}
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
      <path fillRule="evenodd" clipRule="evenodd" d="M30.1926 4.84613C29.4294 5.30005 28.7111 6.07823 27.2746 7.6346L38.9962 19.6087C40.5197 18.1413 41.2815 17.4075 41.7259 16.6279C42.7981 14.7466 42.8314 12.4301 41.8138 10.5175C41.3922 9.72476 40.6518 8.96848 39.1711 7.45592C37.6904 5.94336 36.9502 5.18708 36.1743 4.75628C34.3019 3.7168 32.0341 3.75086 30.1926 4.84613ZM36.1743 22.3267L24.6138 10.5175L9.37551 27.0274C7.04414 29.5534 5.87828 30.8166 5.20233 32.3724C4.52621 33.9287 4.39135 35.6598 4.1216 39.1223L4.06955 39.7903C3.97371 41.0203 3.92579 41.6355 4.2768 42.0337C4.6278 42.4322 5.23164 42.448 6.43929 42.4796L6.97901 42.4937C10.9459 42.5974 12.9294 42.6493 14.7336 41.9445C16.5378 41.2399 17.9815 39.8494 20.8686 37.0685L36.1743 22.3267Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M25.6867 42.5542C25.6867 41.7557 26.334 41.1084 27.1325 41.1084H42.5542C43.3527 41.1084 44 41.7557 44 42.5542C44 43.3527 43.3527 44 42.5542 44H27.1325C26.334 44 25.6867 43.3527 25.6867 42.5542Z" fill="currentColor"/>
  </svg>
);
