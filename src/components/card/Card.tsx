import React from 'react';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  size: 's' | 'm';
  text: 'min' | 'max';
  theme: 'light';
  pressed: boolean;
  children?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  size,
  text,
  theme,
  pressed,
  children,
  className,
  ...rest
}) => {
  const cardClasses = [
    styles.card,
    size === 's' ? styles.cardSizeS : styles.cardSizeM,
    text === 'min' ? styles.cardTextMin : styles.cardTextMax,
    styles.cardThemeLight,
    pressed ? styles.cardPressed : styles.cardDefault,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} {...rest}>
      {children}
    </div>
  );
};
