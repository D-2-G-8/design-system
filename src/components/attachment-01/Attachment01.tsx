import * as React from 'react';
import styles from './Attachment01.module.css';

export interface Attachment01Props extends React.HTMLAttributes<HTMLDivElement> {
  fileName: string;
  fileSize: string;
  icon?: React.ReactNode;
  onDownload?: () => void;
  onDelete?: () => void;
}

export const Attachment01: React.FC<Attachment01Props> = ({
  fileName,
  fileSize,
  icon,
  onDownload,
  onDelete,
  className,
  ...props
}) => {
  return (
    <div className={`${styles.attachment} ${className || ''}`} {...props}>
      {icon && <div className={styles.attachmentIcon}>{icon}</div>}
      <div className={styles.attachmentName}>{fileName}</div>
      <div className={styles.attachmentSize}>{fileSize}</div>
      <div className={styles.attachmentActions}>
        {onDownload && (
          <button
            type="button"
            className={styles.attachmentButton}
            onClick={onDownload}
            aria-label="Download attachment"
          >
            Download
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            className={styles.attachmentButton}
            onClick={onDelete}
            aria-label="Delete attachment"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
