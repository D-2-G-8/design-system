import React from 'react';
import styles from './Avatar.module.scss';
import { Badgecount } from '../badgecount';
import { FillProfile2 } from '../../icons/fill-profile2';
import { Iconbutton } from '../iconbutton';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the avatar in pixels.
   * Defaults to '48' if omitted.
   */
  size?: '24' | '32' | '40' | '48' | '64' | '96';
  
  /**
   * Display mode: 'img' renders an image, 'text' shows initials or custom text, 'icon' renders a fallback icon.
   * Defaults to 'img' if omitted.
   */
  type?: 'img' | 'text' | 'icon';
  
  /**
   * Whether the avatar uses a rounded square shape instead of a circle.
   * Pass true for square corners, omit or pass false for fully rounded circle.
   */
  square?: boolean;
  
  /**
   * Image source URL when type is 'img'.
   * Required for type='img', ignored for other types.
   */
  src?: string;
  
  /**
   * Accessible alt text for the image when type is 'img'.
   * Recommended for accessibility, ignored for other types.
   */
  alt?: string;
  
  /**
   * Text content (typically initials) when type is 'text'.
   * Required for type='text', ignored for other types.
   */
  text?: string;
  
  /**
   * Icon element to render when type is 'icon'.
   * Pass a design-system icon component instance, ignored for other types.
   */
  icon?: React.ReactNode;
  
  /**
   * Whether to show a badge overlay in the bottom-right corner.
   * Pass true to render the badge, omit or pass false to hide it.
   */
  badge?: boolean;
  
  /**
   * Count value to display in the badge when badge is true.
   * Defaults to undefined; typically set to a meaningful count when badge is true.
   */
  badgeCount?: number;
  
  /**
   * Whether to show an edit icon button overlay (sizes 48px and above).
   * Pass true to render the button, omit or pass false to hide it.
   */
  editButton?: boolean;
  
  /**
   * Callback fired when the edit button is clicked.
   * Only relevant when editButton is true.
   */
  onEditClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = '48',
  type = 'img',
  square = false,
  src,
  alt = '',
  text,
  icon,
  badge = false,
  badgeCount,
  editButton = false,
  onEditClick,
  className,
  ...rest
}) => {
  const sizeClass = {
    '24': styles.size24,
    '32': styles.size32,
    '40': styles.size40,
    '48': styles.size48,
    '64': styles.size64,
    '96': styles.size96,
  }[size];

  const typeClass = {
    img: styles.typeImg,
    text: styles.typeText,
    icon: styles.typeIcon,
  }[type];

  const shapeClass = square ? styles.squared : styles.rounded;

  const badgeSize = {
    '24': 'xs' as const,
    '32': '16' as const,
    '40': '16' as const,
    '48': '16' as const,
    '64': '24' as const,
    '96': '32' as const,
  }[size];

  const editButtonSize = {
    '48': '24' as const,
    '64': '32' as const,
    '96': '40' as const,
  }[size];

  const iconSize = {
    '24': 16,
    '32': 16,
    '40': 20,
    '48': 24,
    '64': 32,
    '96': 48,
  }[size];

  const showEditButton = editButton && editButtonSize !== undefined;

  return (
    <div
      className={`${styles.root} ${sizeClass} ${typeClass} ${shapeClass} ${badge ? styles.withBadge : ''} ${showEditButton ? styles.withEditButton : ''} ${className || ''}`.trim()}
      {...rest}
    >
      <div className={styles.container}>
        {type === 'img' && (
          <img src={src} alt={alt} className={styles.img} />
        )}
        {type === 'text' && (
          <span className={styles.textContent}>
            {text}
          </span>
        )}
        {type === 'icon' && (
          <div className={styles.iconContent} style={{ width: iconSize, height: iconSize }}>
            {icon || <FillProfile2 style={{ width: iconSize, height: iconSize }} />}
          </div>
        )}
      </div>

      {showEditButton && (
        <div className={styles.editButtonCont}>
          <Iconbutton
            size={editButtonSize}
            appearance="primary"
          />
        </div>
      )}

      {badge && (
        <div className={styles.badgeCont}>
          <Badgecount
            value={badgeCount ?? 5}
            size={badgeSize}
            appearance="negative"
            square={false}
          />
        </div>
      )}
    </div>
  );
};