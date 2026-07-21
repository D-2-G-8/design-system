import React from 'react';
import styles from './Avatar.module.scss';
import { Badgecount } from '../badgecount';
import { FillProfile2 } from '../../icons/fill-profile2';
import { Iconbutton } from '../iconbutton';
import { FillEdit } from '../../icons/fill-edit';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Avatar size in pixels; determines container dimensions, corner radius, and icon/text scale.
   * @default 48
   */
  size?: 24 | 32 | 40 | 48 | 64 | 96;
  
  /**
   * Content type: 'img' for image URLs, 'text' for initials/letters, 'icon' for icon components.
   * Pass together with the corresponding content prop (src/alt for img, text for text, icon for icon).
   */
  type: 'img' | 'text' | 'icon';
  
  /**
   * Image URL when type='img'; required for img avatars, ignored otherwise.
   */
  src?: string;
  
  /**
   * Alt text for the image when type='img'; required for accessibility when using img avatars.
   */
  alt?: string;
  
  /**
   * Text content (typically initials like 'BM') when type='text'; required for text avatars, ignored otherwise.
   */
  text?: string;
  
  /**
   * Icon component to render when type='icon'; swaps out the default FillProfile2 icon when provided.
   */
  icon?: React.ReactNode;
  
  /**
   * Whether to use squared corners (radius-6/8/10/12/16/32 depending on size) instead of fully rounded (radius-1000).
   * @default false
   */
  squared?: boolean;
  
  /**
   * Whether to show the notification badge in the bottom-right corner; controls badge visibility.
   * Use badgeValue prop to set the badge number.
   * @default false
   */
  withBadge?: boolean;
  
  /**
   * Numeric value to display in the badge; only visible when withBadge is true.
   */
  badgeValue?: number;
  
  /**
   * Whether to show the edit icon button overlay (48px+ sizes only); pass true to display the button, false or omit to hide it.
   * @default false
   */
  withEditButton?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 48,
  type,
  src,
  alt,
  text,
  icon,
  squared = false,
  withBadge = false,
  badgeValue = 5,
  withEditButton = false,
  className,
  ...rest
}) => {
  const sizeClass = styles[`size${size}` as keyof typeof styles];
  const typeClass = styles[`type${type.charAt(0).toUpperCase()}${type.slice(1)}` as keyof typeof styles];
  const shapeClass = squared ? styles.squared : styles.rounded;

  const getBadgeSize = () => {
    if (size === 24) return 'XS';
    if (size === 32 || size === 40 || size === 48) return '16 px';
    if (size === 64) return '24 px';
    return '32 px';
  };

  const getEditButtonSize = () => {
    if (size === 48) return '24 px';
    if (size === 64) return '32 px';
    return '40 px';
  };

  const getIconSize = () => {
    if (size === 24) return 16;
    if (size === 32) return 16;
    if (size === 40) return 20;
    if (size === 48) return 24;
    if (size === 64) return 32;
    return 48;
  };

  return (
    <div
      className={`${styles.avatar} ${sizeClass} ${typeClass} ${shapeClass} ${className || ''}`}
      {...rest}
    >
      <div className={styles.container}>
        {type === 'img' && (
          <img className={styles.img} src={src} alt={alt} />
        )}
        {type === 'text' && (
          <span className={styles.textContent}>
            {text}
          </span>
        )}
        {type === 'icon' && (
          <span className={styles.iconContent}>
            {icon || <FillProfile2 width={getIconSize()} height={getIconSize()} />}
          </span>
        )}
      </div>
      
      {size >= 48 && withEditButton && (
        <Iconbutton
          className={styles.editButton}
          size={getEditButtonSize() as '24 px' | '32 px' | '40 px'}
          appearance="Primary"
          icon={<FillEdit />}
        />
      )}
      
      {withBadge && (
        <div className={styles.badgeCont}>
          <Badgecount
            value={badgeValue}
            size={getBadgeSize() as 'XS' | '16 px' | '24 px' | '32 px'}
            appearance="Negative"
            squared={false}
          />
        </div>
      )}
    </div>
  );
};