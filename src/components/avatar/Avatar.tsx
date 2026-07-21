import React from 'react';
import styles from './Avatar.module.scss';
import { Badgecount } from '../badgecount';
import { FillProfile2 } from '../../icons/fill-profile2';
import { Iconbutton } from '../iconbutton';
import { Edit } from '../../icons/edit';

export interface AvatarProps {
  /**
   * Avatar size in pixels; controls container dimensions, text/icon scaling, and badge/edit-button sizing.
   * Defaults to '48' when omitted.
   */
  size?: '24' | '32' | '40' | '48' | '64' | '96';
  
  /**
   * Content type: 'img' for an image source, 'text' for initials/letters, or 'icon' for a custom icon.
   * Determines which content is rendered and which fallback background applies.
   */
  type: 'img' | 'text' | 'icon';
  
  /**
   * When true, uses rounded-square corners (radius-6 to radius-32 depending on size);
   * when false or omitted, uses fully circular (radius-1000) shape.
   */
  squared?: boolean;
  
  /**
   * Image URL when type='img'; rendered as the avatar's background or img element.
   * Only used when type='img'.
   */
  src?: string;
  
  /**
   * Alt text for the image when type='img'; required for accessibility when src is provided.
   * Only used when type='img'.
   */
  alt?: string;
  
  /**
   * Initials or short text (e.g. 'ВМ') when type='text'; displayed centered on the new-style-base-1 background.
   * Only used when type='text'.
   */
  textValue?: string;
  
  /**
   * Custom icon component when type='icon'; if omitted, falls back to FillProfile2.
   * Only used when type='icon'.
   */
  icon?: React.ReactNode;
  
  /**
   * When true, displays a badge in the bottom-right corner. Defaults to false.
   */
  badge?: boolean;
  
  /**
   * Badge value to display; passed to the Badgecount component.
   * Only used when badge is true. Defaults to 5 if omitted.
   */
  badgeValue?: number;
  
  /**
   * When true, displays an edit button in the bottom-right corner (only for sizes 48px and above).
   * Defaults to false.
   */
  editButton?: boolean;
  
  /**
   * Click handler for the edit button when present;
   * called when the user clicks the edit icon.
   */
  onEditClick?: (event: React.MouseEvent) => void;
  
  /**
   * Additional CSS class name(s) appended to the root container for custom styling.
   * Merged with internal size/type/squared classes.
   */
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = '48',
  type,
  squared = false,
  src,
  alt,
  textValue,
  icon,
  badge = false,
  badgeValue = 5,
  editButton = false,
  onEditClick,
  className,
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

  const shapeClass = squared ? styles.squared : styles.circular;

  const badgeSize = {
    '24': 'xs' as const,
    '32': '16' as const,
    '40': '16' as const,
    '48': '16' as const,
    '64': '24' as const,
    '96': '32' as const,
  }[size];

  const iconSize = {
    '24': 16,
    '32': 16,
    '40': 20,
    '48': 24,
    '64': 32,
    '96': 48,
  }[size];

  const editButtonSize = {
    '48': '24' as const,
    '64': '32' as const,
    '96': '40' as const,
  }[size];

  const hasEditButton = editButton && (size === '48' || size === '64' || size === '96');
  const hasBadge = badge;

  return (
    <div
      className={[
        styles.root,
        sizeClass,
        typeClass,
        shapeClass,
        hasBadge && styles.withBadge,
        hasEditButton && styles.withEditButton,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.container}>
        {type === 'img' && src && (
          <img src={src} alt={alt || ''} className={styles.img} />
        )}
        {type === 'text' && textValue && (
          <span className={styles.text}>{textValue}</span>
        )}
        {type === 'icon' && (
          <span className={styles.icon}>
            {icon || <FillProfile2 width={iconSize} height={iconSize} />}
          </span>
        )}
      </div>

      {hasEditButton && (
        <div className={styles.editButton}>
          <Iconbutton
            icon={<Edit />}
            size={editButtonSize}
            appearance="primary"
            onClick={onEditClick}
          />
        </div>
      )}

      {hasBadge && (
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