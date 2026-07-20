import React from 'react';
import styles from './Attach.module.css';

export interface AttachProps extends React.HTMLAttributes<HTMLDivElement> {
  theme: 'light' | 'dark';
  appearance: 'desktop' | 'mobile';
  state: 'passive' | 'filled' | 'limit' | 'error';
}

export const Attach: React.FC<AttachProps> = ({
  theme,
  appearance,
  state,
  className,
  ...props
}) => {
  const attachClasses = [
    styles.attach,
    styles[`attach${appearance.charAt(0).toUpperCase() + appearance.slice(1)}` as keyof typeof styles],
    styles[`attach${theme.charAt(0).toUpperCase() + theme.slice(1)}` as keyof typeof styles],
    styles[`attach${state.charAt(0).toUpperCase() + state.slice(1)}` as keyof typeof styles],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={attachClasses} {...props}>
      <div className={styles.container}>
        <div className={styles.icon} />
        <div className={styles.label}>
          {state === 'passive' && 'Attach file'}
          {state === 'filled' && 'File attached'}
          {state === 'limit' && 'Size limit exceeded'}
          {state === 'error' && 'Upload failed'}
        </div>
        {state === 'filled' && <div className={styles.counter}>1</div>}
      </div>
      {state === 'limit' && <div className={styles.limitMessage}>Maximum file size is 10MB</div>}
      {state === 'error' && <div className={styles.errorMessage}>Please try again</div>}
    </div>
  );
};
