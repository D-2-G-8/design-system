import React from "react";
import styles from "./FillProfile2.module.scss";

export interface FillProfile2Props extends React.SVGProps<SVGSVGElement> {
  /** Width and height in px (icons are square). Defaults to 24. */
  size?: number | string;
}

/** Auto-generated from Figma -- the real exported SVG, colored via `currentColor`. */
export const FillProfile2: React.FC<FillProfile2Props> = ({ size = 24, className, ...props }) => (
  <svg
    className={[styles.icon, className].filter(Boolean).join(" ")}
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
      <path fillRule="evenodd" clipRule="evenodd" d="M16.4089 12.0745C16.4089 7.61509 19.8075 4 24 4C28.1926 4 31.5912 7.61509 31.5912 12.0745C31.5912 16.534 28.1926 20.1491 24 20.1491C19.8075 20.1491 16.4089 16.534 16.4089 12.0745Z" fill="currentColor"/>
      <path d="M33.5915 28.9973C27.7271 24.8187 20.2729 24.8187 14.4085 28.9974C14.2087 29.1397 13.9644 29.3047 13.6897 29.4903C12.5035 30.2916 10.7489 31.4768 9.54764 32.8838C8.79128 33.7697 8.13628 34.8685 8.0187 36.1558C7.89646 37.494 8.37303 38.8138 9.46643 40.0603C11.3789 42.2405 13.6802 44 16.6766 44H31.3235C34.3198 44 36.6212 42.2405 38.5336 40.0603C39.627 38.8138 40.1035 37.494 39.9813 36.1558C39.8637 34.8685 39.2087 33.7697 38.4524 32.8838C37.2511 31.4768 35.4965 30.2916 34.3102 29.4902C34.0355 29.3047 33.7913 29.1397 33.5915 28.9973Z" fill="currentColor"/>
  </svg>
);
