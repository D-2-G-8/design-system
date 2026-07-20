import React from 'react';
import styles from './IconSoc.module.css';

export interface IconSocProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'vk' | 'odnoklassniki' | 'telegram' | 'youTube';
}

export const IconSoc: React.FC<IconSocProps> = ({ type, className, ...props }) => {
  const typeClassMap = {
    vk: styles.iconVk,
    odnoklassniki: styles.iconOdnoklassniki,
    telegram: styles.iconTelegram,
    youTube: styles.iconYouTube,
  };

  const typeClass = typeClassMap[type];
  const combinedClassName = [styles.iconSoc, typeClass, className].filter(Boolean).join(' ');

  return <div className={combinedClassName} {...props} />;
};
