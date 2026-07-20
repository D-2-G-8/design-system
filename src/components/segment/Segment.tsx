import React from 'react';
import styles from './Segment.module.css';

export interface SegmentProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  size: 'sm' | 'md';
  children?: React.ReactNode;
}

export const Segment: React.FC<SegmentProps> = ({
  active,
  size,
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={[
        styles.segment,
        active ? styles.segmentActive : '',
        size === 'sm' ? styles.segmentSm : styles.segmentMd,
        className
      ].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  );
};
