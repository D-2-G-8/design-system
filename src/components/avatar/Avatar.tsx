import React from 'react';
import styles from './Avatar.module.scss';
import { Badgecount } from '../badgecount';
import { FillProfile2 } from '../../icons/fill-profile2';
import { Iconbutton } from '../iconbutton';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 24 | 32 | 40 | 48 | 64 | 96;
  type?: 'img' | 'text' | 'icon';
  squared?: boolean;
  src?: string;
  alt?: string;
  text?: string;
  icon?: React.ReactNode;
  badge?: boolean;
  badgeValue?: number;
  editButton?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 40,
  type = 'img',
  squared = false,
  src,
  alt,
  text,
  icon,
  badge = false,
  badgeValue = 5,
  editButton = false,
  className,
  ...props
}) => {
  const sizeClass = styles[`size${size}` as keyof typeof styles];
  const typeClass = styles[`type${type.charAt(0).toUpperCase()}${type.slice(1)}` as keyof typeof styles];
  const squaredClass = squared ? styles.squared : '';
  const withBadgeClass = badge ? styles.withBadge : '';
  const withEditButtonClass = editButton ? styles.withEditButton : '';

  const getBadgeSize = (): 'XS' | '16 px' | '24 px' | '32 px' => {
    if (size === 24) return 'XS';
    if (size === 32 || size === 40 || size === 48) return '16 px';
    if (size === 64) return '24 px';
    return '32 px';
  };

  const getIconSize = (): number => {
    if (size === 24) return 16;
    if (size === 32) return 16;
    if (size === 40) return 20;
    if (size === 48) return 24;
    if (size === 64) return 32;
    return 48;
  };

  const getEditButtonSize = (): '24 px' | '32 px' | '40 px' => {
    if (size === 48) return '24 px';
    if (size === 64) return '32 px';
    return '40 px';
  };

  const getTextContent = () => {
    if (type === 'text' && text) {
      return text;
    }
    return 'ВМ';
  };

  return (
    <div
      className={`${styles.avatar} ${sizeClass} ${typeClass} ${squaredClass} ${withBadgeClass} ${withEditButtonClass} ${className || ''}`.trim()}
      {...props}
    >
      <div className={styles.container}>
        {type === 'img' && (
          <img src={src} alt={alt} className={styles.img} />
        )}
        {type === 'text' && (
          <div className={styles.text}>{getTextContent()}</div>
        )}
        {type === 'icon' && (
          <div className={styles.icon}>
            {icon || <FillProfile2 width={getIconSize()} height={getIconSize()} />}
          </div>
        )}
      </div>

      {editButton && (size === 48 || size === 64 || size === 96) && (
        <div className={styles.editButton}>
          <Iconbutton
            size={getEditButtonSize()}
            appearance="Primary"
            state="Default"
          />
        </div>
      )}

      {badge && (
        <div className={styles.badgeCont}>
          <Badgecount
            value={badgeValue}
            size={getBadgeSize()}
            appearance="Negative"
            square={false}
          />
        </div>
      )}
    </div>
  );
};
