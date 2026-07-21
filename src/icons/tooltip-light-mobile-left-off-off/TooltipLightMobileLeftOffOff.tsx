import React from "react";
import styles from "./TooltipLightMobileLeftOffOff.module.scss";

export interface TooltipLightMobileLeftOffOffProps {
  /** The text content displayed inside the tooltip; pass the message you want to show to the user when the tooltip appears. */
  text: string;
}

export const TooltipLightMobileLeftOffOff: React.FC<
  TooltipLightMobileLeftOffOffProps
> = ({ text }) => {
  return (
    <div className={styles.tooltip}>
      <div className={styles.content}>{text}</div>
    </div>
  );
};
