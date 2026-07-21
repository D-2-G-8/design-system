import React from 'react';
import styles from './Avatar.module.scss';
import { Badgecount } from '../badgecount';
import { FillProfile2 } from '../../icons/fill-profile2';
import { OutlineBoldPlus } from '../../icons/outline-bold-plus';

export interface AvatarProps {
  /** Avatar size in pixels; controls both the container dimensions and internal text/icon scaling, with 24 as the smallest and 96 as the largest. */
  size: 24 | 32 | 40 | 48 | 64 | 96;
  /** Avatar content type: 'img' displays an image via the `src` prop, 'text' displays initials via the `text` prop, 'icon' displays an icon via the `icon` prop. */
  type: 'img' | 'text' | 'icon';
  /** When true, renders the avatar with squared corners (border-radius scales with size); when false or omitted, renders fully circular (border-radius 1000px). */
  squared?: boolean;
  /** Image URL to display when `type` is 'img'; required for img type, ignored for text/icon types. */
  src?: string;
  /** Alt text for the image when `type` is 'img'; improves accessibility, ignored for text/icon types. */
  alt?: string;
  /** Initials or short text to display when `type` is 'text' (typically 1-2 uppercase characters); required for text type, ignored for img/icon types. */
  text?: string;
  /** Icon component to render when `type` is 'icon'; pass a design-system icon instance; required for icon type, ignored for img/text types. */
  icon?: React.ReactNode;
  /** When true, renders a BadgeCount component in the bottom-right corner of the avatar; omit or pass false to hide the badge. */
  badge?: boolean;
  /** Numeric value to display in the badge when `badge` is true; ignored if badge is false or omitted. */
  badgeValue?: number;
  /** When true (and size >= 48px), renders an IconButton overlay in the bottom-right corner for editing; omit or pass false to hide the edit button. */
  editButton?: boolean;
  /** Callback fired when the edit button is clicked; only relevant when `editButton` is true. */
  onEditClick?: () => void;
  /** Additional CSS class name(s) to apply to the outermost avatar container for custom styling or layout integration. */
  className?: string;
}

const getContainerRadius = (size: number, squared: boolean): string => {
  if (!squared) return '1000px';
  switch (size) {
    case 24: return '6px';
    case 32: return '8px';
    case 40: return '10px';
    case 48: return '12px';
    case 64: return '16px';
    case 96: return '32px';
    default: return '1000px';
  }
};

const getTextFontSize = (size: number): number => {
  switch (size) {
    case 24: return 10;
    case 32: return 14;
    case 40: return 16;
    case 48: return 16;
    case 64: return 20;
    case 96: return 24;
    default: return 10;
  }
};

const getTextLineHeight = (size: number): number => {
  switch (size) {
    case 24: return 12;
    case 32: return 16;
    case 40: return 20;
    case 48: return 20;
    case 64: return 24;
    case 96: return 32;
    default: return 12;
  }
};

const getIconSize = (size: number): number => {
  switch (size) {
    case 24: return 16;
    case 32: return 16;
    case 40: return 20;
    case 48: return 24;
    case 64: return 32;
    case 96: return 48;
    default: return 16;
  }
};

const getBadgeSize = (size: number): 'XS' | '16 px' | '24 px' | '32 px' => {
  if (size === 24) return 'XS';
  if (size === 64) return '24 px';
  if (size === 96) return '32 px';
  return '16 px';
};

const getEditButtonSize = (size: number): number => {
  if (size === 48) return 24;
  if (size === 64) return 32;
  if (size === 96) return 40;
  throw new Error(`Edit button not supported for size ${size}`);
};

const getEditButtonIconSize = (size: number): number => {
  if (size === 96) return 24;
  return 16;
};

export const Avatar: React.FC<AvatarProps> = ({
  size,
  type,
  squared = false,
  src,
  alt = '',
  text,
  icon,
  badge = false,
  badgeValue = 5,
  editButton = false,
  onEditClick,
  className,
}) => {
  const showEditButton = editButton && size >= 48;
  const containerRadius = getContainerRadius(size, squared);
  const fontSize = getTextFontSize(size);
  const lineHeight = getTextLineHeight(size);
  const iconSize = getIconSize(size);
  const badgeSize = getBadgeSize(size);
  const editButtonSize = showEditButton ? getEditButtonSize(size) : 0;
  const editButtonIconSize = showEditButton ? getEditButtonIconSize(size) : 0;

  const avatarClasses = [
    styles.avatar,
    styles[`size${size}`],
    styles[`type${type.charAt(0).toUpperCase() + type.slice(1)}`],
    squared ? styles.squared : styles.circular,
    badge ? styles.withBadge : '',
    showEditButton ? styles.withEditButton : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={avatarClasses} style={{ width: size, height: size }}>
      <div
        className={styles.container}
        style={{
          width: size,
          height: size,
          borderRadius: containerRadius,
        }}
      >
        {type === 'img' && (
          <img
            className={styles.img}
            src={src}
            alt={alt}
            style={{
              width: size,
              height: size,
              borderRadius: containerRadius,
            }}
          />
        )}
        {type === 'text' && (
          <span
            className={styles.text}
            style={{
              fontSize,
              lineHeight: `${lineHeight}px`,
              fontWeight: 500,
              fontFamily: 'Roboto Flex, sans-serif',
              color: 'var(--label-light-primary)',
              letterSpacing: size >= 64 ? (size === 64 ? '-0.04px' : '-0.05px') : undefined,
            }}
          >
            {text}
          </span>
        )}
        {type === 'icon' && (
          <div className={styles.icon} style={{ width: iconSize, height: iconSize }}>
            {icon || <FillProfile2 style={{ width: iconSize, height: iconSize }} />}
          </div>
        )}
      </div>

      {showEditButton && (
        <button
          className={styles.editButtonWrapper}
          style={{
            width: editButtonSize,
            height: editButtonSize,
            borderRadius: '1000px',
            backgroundColor: 'var(--label-dark-primary)',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={onEditClick}
          aria-label="Edit avatar"
          type="button"
        >
          <OutlineBoldPlus
            style={{
              width: editButtonIconSize,
              height: editButtonIconSize,
              color: 'var(--label-light-primary)',
            }}
          />
        </button>
      )}

      {badge && (
        <div
          className={styles.badgeCont}
          style={{
            borderRadius: '1000px',
            backgroundColor: 'var(--label-dark-primary)',
            padding: size === 24 ? '1px' : '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Badgecount value={badgeValue} size={badgeSize} appearance="Negative" square={false} />
        </div>
      )}
    </div>
  );
};
