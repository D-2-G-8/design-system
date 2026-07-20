import React, { useState, useEffect, useRef, ReactNode } from 'react';
import styles from './ContextMenu.module.css';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick?: () => void;
  separator?: boolean;
}

export interface ContextMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ContextMenuItem[];
  onClose?: () => void;
  position?: { x: number; y: number };
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  onClose,
  position = { x: 0, y: 0 },
  className,
  ...props
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled && !item.separator) {
      item.onClick?.();
      onClose?.();
    }
  };

  const handleMouseEnter = (index: number) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(-1);
  };

  return (
    <div
      ref={menuRef}
      className={`${styles.contextMenu} ${className || ''}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      {...props}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return <div key={item.id} className={styles.separator} />;
        }

        const itemClassName = [
          styles.menuItem,
          activeIndex === index ? styles.menuItemHover : '',
          item.disabled ? styles.menuItemDisabled : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div
            key={item.id}
            className={itemClassName}
            onClick={() => handleItemClick(item)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {item.icon && <span className={styles.menuItemIcon}>{item.icon}</span>}
            <span className={styles.menuItemLabel}>{item.label}</span>
            {item.shortcut && <span className={styles.menuItemShortcut}>{item.shortcut}</span>}
          </div>
        );
      })}
    </div>
  );
};
