import React from 'react';
import styles from './Avatar.module.scss';
import { Badgecount } from '../badgecount';
import { FillProfile2 } from '../../icons/fill-profile2';
import { Iconbutton } from '../iconbutton';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Avatar size in pixels, controlling both the container dimensions and the internal content (image, text, or icon) scaling.
   * Defaults to '48' if omitted.
   */
  size?: '24' | '32' | '40' | '48' | '64' | '96';
  
  /**
   * Content type displayed inside the avatar: 'img' for a user image, 'text' for initials, or 'icon' for a generic profile icon.
   * Defaults to 'img'.
   */
  type?: 'img' | 'text' | 'icon';
  
  /**
   * When true, applies a moderately rounded square border-radius (proportional to size); when false, applies a fully circular border-radius.
   * Defaults to false for circular avatars.
   */
  squared?: boolean;
  
  /**
   * Image source URL; required when type='img', ignored for other types.
   */
  src?: string;
  
  /**
   * Accessible alt text for the image; required when type='img' to describe the user for screen readers, ignored for other types.
   */
  alt?: string;
  
  /**
   * Text content (typically user initials like 'VM') displayed when type='text'; required for text type, ignored otherwise.
   */
  text?: string;
  
  /**
   * Custom icon component or element rendered when type='icon'; if omitted for icon type, a default profile icon is shown.
   */
  icon?: React.ReactNode;
  
  /**
   * When true, renders a badge count overlay in the bottom-right corner; defaults to false, hiding the badge entirely.
   */
  withBadge?: boolean;
  
  /**
   * Numeric value displayed in the badge overlay; only rendered when withBadge is true, otherwise ignored.
   */
  badgeValue?: number;
  
  /**
   * When true, renders an edit icon button overlay (48px and larger sizes only); defaults to false, hiding the edit button.
   */
  withEditButton?: boolean;
  
  /**
   * Callback fired when the edit button is clicked; only applies when withEditButton is true, otherwise ignored.
   */
  onEditClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = '48',
  type = 'img',
  squared = false,
  src,
  alt,
  text,
  icon,
  withBadge = false,
  badgeValue = 5,
  withEditButton = false,
  onEditClick,
  className,
  ...rest
}) => {
  const sizeClass = styles[`size${size}`];
  const typeClass = styles[`type${type.charAt(0).toUpperCase() + type.slice(1)}`];
  const shapeClass = squared ? styles.squared : styles.circular;
  
  const badgeSize = size === '24' ? 'xs' : (size === '32' || size === '40' || size === '48') ? '16' : size === '64' ? '24' : '32';
  
  const iconSize = size === '24' ? 16 : size === '32' ? 16 : size === '40' ? 20 : size === '48' ? 24 : size === '64' ? 32 : 48;
  
  const showEditButton = withEditButton && (size === '48' || size === '64' || size === '96');
  const editButtonSize = size === '48' ? '24px' : size === '64' ? '32px' : '40px';
  
  const textContent = text || '';
  
  return (
    <div
      className={`${styles.avatar} ${sizeClass} ${typeClass} ${shapeClass} ${className || ''}`.trim()}
      {...rest}
    >
      <div className={styles.container}>
        {type === 'img' && (
          <img src={src} alt={alt} className={styles.img} />
        )}
        {type === 'text' && (
          <div className={styles.text}>{textContent}</div>
        )}
        {type === 'icon' && (
          <div className={styles.icon}>
            {icon || <FillProfile2 width={iconSize} height={iconSize} />}
          </div>
        )}
      </div>
      
      {showEditButton && (
        <div className={styles.editButton}>
          <Iconbutton
            size={editButtonSize}
            appearance="primary"
            onClick={onEditClick}
          />
        </div>
      )}
      
      {withBadge && (
        <div className={styles.badgeCont}>
          <Badgecount
            value={badgeValue}
            size={badgeSize}
            appearance="negative"
            square={false}
          />
        </div>
      )}
    </div>
  );
};