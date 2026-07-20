import React from 'react';
import styles from './VariantItem.module.css';

export interface VariantItemProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'instance' | 'boolean' | 'text';
}

export const VariantItem: React.FC<VariantItemProps> = ({
  type,
  className,
  ...props
}) => {
  const typeClassName = 
    type === 'instance' ? styles.variantItemInstance :
    type === 'boolean' ? styles.variantItemBoolean :
    styles.variantItemText;

  return (
    <div
      className={`${styles.variantItem} ${typeClassName} ${className || ''}`.trim()}
      {...props}
    >
      <div className={styles.icon} />
      <div className={styles.label}>
        {type === 'instance' && 'Instance swap'}
        {type === 'boolean' && 'Boolean'}
        {type === 'text' && 'Text'}
      </div>
      <div className={styles.content} />
    </div>
  );
};
