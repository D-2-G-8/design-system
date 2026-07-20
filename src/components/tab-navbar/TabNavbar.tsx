import React from 'react';
import styles from './TabNavbar.module.css';

export interface TabNavbarProps extends React.HTMLAttributes<HTMLDivElement> {
  device: 'desktop' | 'mobile';
  showCounter: boolean;
}

export function TabNavbar({ device, showCounter, className, ...props }: TabNavbarProps) {
  const [activeTab, setActiveTab] = React.useState(0);
  
  const tabs = ['Overview', 'Features', 'Analytics', 'Reports'];
  
  const tabNavbarClass = [
    styles.tabNavbar,
    device === 'desktop' ? styles.tabNavbarDesktop : styles.tabNavbarMobile,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <div className={tabNavbarClass} {...props}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((label, index) => (
          <button
            key={index}
            className={`${styles.tab} ${activeTab === index ? styles.tabActive : styles.tabInactive}`}
            role="tab"
            aria-selected={activeTab === index}
            onClick={() => setActiveTab(index)}
            type="button"
          >
            <span className={styles.tabLabel}>{label}</span>
            {showCounter && index === 1 && (
              <span className={styles.counter}>3</span>
            )}
            {activeTab === index && <span className={styles.underline} />}
          </button>
        ))}
      </div>
    </div>
  );
}
