import React from 'react';
import styles from './Desciption.module.css';

export interface DesciptionProps extends React.HTMLAttributes<HTMLDivElement> {
  property1: 'checkFileNames' | 'sortFiles' | 'reserveSpace' | 'rememberHow';
}

const descriptionTexts = {
  checkFileNames: 'Внимательно проверяем названия файлов',
  sortFiles: 'Бережно сортируем файлы по ассетам',
  reserveSpace: 'Резервируем место на диске',
  rememberHow: 'Вспоминаем как тут всё работает',
};

export const Desciption: React.FC<DesciptionProps> = ({ property1, className, ...rest }) => {
  return (
    <div className={`${styles.description} ${className || ''}`.trim()} {...rest}>
      <div className={styles.container}>
        <span className={styles.text}>{descriptionTexts[property1]}</span>
      </div>
    </div>
  );
};
