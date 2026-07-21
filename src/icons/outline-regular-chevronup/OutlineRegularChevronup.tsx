import React from "react";
import styles from "./OutlineRegularChevronup.module.scss";

export interface OutlineRegularChevronupProps
  extends React.SVGAttributes<SVGSVGElement> {}

export function OutlineRegularChevronup({
  ...props
}: OutlineRegularChevronupProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        className={styles.icon}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 8.29289L5.70711 14.5858C5.31658 14.9763 4.68342 14.9763 4.29289 14.5858C3.90237 14.1953 3.90237 13.5621 4.29289 13.1716L11.2929 6.17157C11.6834 5.78105 12.3166 5.78105 12.7071 6.17157L19.7071 13.1716C20.0976 13.5621 20.0976 14.1953 19.7071 14.5858C19.3166 14.9763 18.6834 14.9763 18.2929 14.5858L12 8.29289Z"
      />
    </svg>
  );
}
