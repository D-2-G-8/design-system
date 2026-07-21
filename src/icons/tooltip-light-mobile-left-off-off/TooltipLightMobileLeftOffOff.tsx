import React from "react";
import styles from "./TooltipLightMobileLeftOffOff.module.scss";

export interface TooltipLightMobileLeftOffOffProps {
  /** The text content to display inside the tooltip; pass the string you want shown to the user. */
  text: string;
}

export const TooltipLightMobileLeftOffOff: React.FC<TooltipLightMobileLeftOffOffProps> = ({
  text,
}) => {
  return (
    <div className={styles.tooltip}>
      <span className={styles.text}>{text}</span>
    </div>
  );
};
