import React from "react";
import styles from "./KeysIphoneEnter.module.css";

export interface KeysIphoneEnterProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  blueColor: boolean;
}

export const KeysIphoneEnter: React.FC<KeysIphoneEnterProps> = ({
  blueColor,
  className,
  ...props
}) => {
  return (
    <button
      className={`${styles.key} ${blueColor ? styles.keyBlue : ""} ${
        className || ""
      }`.trim()}
      {...props}
    />
  );
};
