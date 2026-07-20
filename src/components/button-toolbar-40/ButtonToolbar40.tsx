import React from 'react';
import styles from './ButtonToolbar40.module.css';

export interface ButtonToolbar40Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  caption: boolean;
  state: 'default' | 'active' | 'disabled';
}

export const ButtonToolbar40: React.FC<ButtonToolbar40Props> = ({
  caption,
  state,
  className,
  disabled,
  ...props
}) => {
  const captionClass = caption ? styles.captionOn : styles.captionOff;
  const stateClass = state === 'active' ? styles.stateActive : state === 'disabled' ? styles.stateDisabled : styles.stateDefault;

  return (
    <button
      className={`${styles.buttonToolbar} ${captionClass} ${stateClass} ${className || ''}`.trim()}
      disabled={state === 'disabled' || disabled}
      {...props}
    />
  );
};
