import React, { ButtonHTMLAttributes, useState } from 'react';
import styles from './Segmentcontroll2.module.css';

export interface Segmentcontroll2Props {
  size: 'm' | 'l';
  resizable: boolean;
  segments?: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  activeSegmentId?: string;
  onSegmentChange?: (segmentId: string) => void;
}

export const Segmentcontroll2: React.FC<Segmentcontroll2Props> = ({
  size,
  resizable,
  segments = [
    { id: '1', label: 'Segment 1' },
    { id: '2', label: 'Segment 2' },
    { id: '3', label: 'Segment 3' }
  ],
  activeSegmentId,
  onSegmentChange
}) => {
  const [activeId, setActiveId] = useState(activeSegmentId || segments[0]?.id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSegmentClick = (segmentId: string) => {
    setActiveId(segmentId);
    onSegmentChange?.(segmentId);
  };

  const controlClassNames = [
    styles.segmentControl,
    size === 'm' ? styles.segmentControlM : styles.segmentControlL,
    resizable ? styles.segmentControlResizable : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={controlClassNames}>
      {segments.map((segment) => {
        const isActive = segment.id === activeId;
        const isHovered = segment.id === hoveredId;

        const segmentClassNames = [
          styles.segment,
          isActive ? styles.segmentActive : '',
          isHovered && !isActive ? styles.segmentHover : ''
        ].filter(Boolean).join(' ');

        return (
          <button
            key={segment.id}
            className={segmentClassNames}
            onClick={() => handleSegmentClick(segment.id)}
            onMouseEnter={() => setHoveredId(segment.id)}
            onMouseLeave={() => setHoveredId(null)}
            type="button"
          >
            {segment.icon && (
              <span className={styles.segmentIcon}>{segment.icon}</span>
            )}
            <span className={styles.segmentLabel}>{segment.label}</span>
          </button>
        );
      })}
    </div>
  );
};
