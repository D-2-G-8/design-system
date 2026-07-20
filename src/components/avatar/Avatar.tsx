import React from 'react';
import styles from './Avatar.module.css';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size: 24 | 32 | 40 | 48 | 64 | 96;
  type: 'img' | 'text' | 'icon';
  square: boolean;
  theme: 'light' | 'dark';
  src?: string;
  alt?: string;
  text?: string;
  icon?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  size,
  type,
  square,
  theme,
  src,
  alt = '',
  text,
  icon,
  className,
  ...props
}) => {
  const sizeClass = styles[`avatarSize${size}` as keyof typeof styles];
  const shapeClass = square ? styles.avatarSquare : styles.avatarCircular;
  const themeClass = theme === 'light' ? styles.avatarLight : styles.avatarDark;
  
  const classes = [
    styles.avatar,
    sizeClass,
    shapeClass,
    themeClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {type === 'img' && src && (
        <img src={src} alt={alt} className={styles.avatarImg} />
      )}
      {type === 'text' && text && (
        <span className={styles.avatarText}>{text}</span>
      )}
      {type === 'icon' && icon && (
        <span className={styles.avatarIcon}>{icon}</span>
      )}
    </div>
  );
};
