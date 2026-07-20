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
        d="M12 8.29289L5.70711 14.5858L4.29289 13.1716L12 5.46447L19.7071 13.1716L18.2929 14.5858L12 8.29289Z"
      />
    </svg>
  );
}
