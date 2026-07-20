import React from 'react';
import styles from './Component5.module.css';

export interface Component5Props extends React.HTMLAttributes<HTMLDivElement> {
  programs?: Array<{
    title: string;
    items: string[];
  }>;
}

export const Component5: React.FC<Component5Props> = ({
  programs = [],
  className,
  ...props
}) => {
  return (
    <div className={`${styles.container} ${className || ''}`} {...props}>
      <h2 className={styles.title}>Программы</h2>
      <div className={styles.content}>
        {programs.map((program, index) => (
          <div key={index} className={styles.section}>
            <h3>{program.title}</h3>
            <ul>
              {program.items.map((item, itemIndex) => (
                <li key={itemIndex} className={styles.item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
