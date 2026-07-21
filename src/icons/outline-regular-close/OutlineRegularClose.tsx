import React from "react";
import styles from "./OutlineRegularClose.module.scss";

export interface OutlineRegularCloseProps extends React.SVGProps<SVGSVGElement> {
  /** Width and height in px (icons are square). Defaults to 24. */
  size?: number | string;
}

/** Auto-generated from Figma -- the real exported SVG, colored via `currentColor`. */
export const OutlineRegularClose: React.FC<OutlineRegularCloseProps> = ({ size = 24, className, ...props }) => (
  <svg
    className={[styles.icon, className].filter(Boolean).join(" ")}
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
      <path d="M36.428 11.572C37.1907 12.3346 37.1907 13.5711 36.428 14.3338L26.7618 24L36.428 33.6662C37.1907 34.4289 37.1907 35.6654 36.428 36.428C35.6654 37.1907 34.4289 37.1907 33.6662 36.428L24 26.7618L14.3338 36.428C13.5711 37.1907 12.3346 37.1907 11.572 36.428C10.8093 35.6654 10.8093 34.4289 11.572 33.6662L21.2382 24L11.572 14.3338C10.8093 13.5711 10.8093 12.3346 11.572 11.572C12.3346 10.8093 13.5711 10.8093 14.3338 11.572L24 21.2382L33.6662 11.572C34.4289 10.8093 35.6654 10.8093 36.428 11.572Z" fill="currentColor"/>
      <path d="M36.428 11.572C37.1907 12.3346 37.1907 13.5711 36.428 14.3338L26.7618 24L36.428 33.6662C37.1907 34.4289 37.1907 35.6654 36.428 36.428C35.6654 37.1907 34.4289 37.1907 33.6662 36.428L24 26.7618L14.3338 36.428C13.5711 37.1907 12.3346 37.1907 11.572 36.428C10.8093 35.6654 10.8093 34.4289 11.572 33.6662L21.2382 24L11.572 14.3338C10.8093 13.5711 10.8093 12.3346 11.572 11.572C12.3346 10.8093 13.5711 10.8093 14.3338 11.572L24 21.2382L33.6662 11.572C34.4289 10.8093 35.6654 10.8093 36.428 11.572Z" fill="currentColor"/>
  </svg>
);
