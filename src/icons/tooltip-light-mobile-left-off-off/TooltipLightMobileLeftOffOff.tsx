import React from "react";
import styles from "./TooltipLightMobileLeftOffOff.module.scss";

export interface TooltipLightMobileLeftOffOffProps {
  text: string;
}

export function TooltipLightMobileLeftOffOff({
  text,
}: TooltipLightMobileLeftOffOffProps) {
  return (
    <div className={styles.tooltip}>
      <div className={styles.text}>{text}</div>
    </div>
  );
}
