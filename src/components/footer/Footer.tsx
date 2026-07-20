import React from 'react';
import styles from './Footer.module.css';

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  size: 'mini' | 'maxi';
  isOpen: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  breakpoint,
  size,
  isOpen,
  className,
  ...props
}) => {
  const footerClasses = [
    styles.footer,
    size === 'mini' ? styles.footerMini : styles.footerMaxi,
    breakpoint === 'mobile' ? styles.footerMobile : breakpoint === 'tablet' ? styles.footerTablet : styles.footerDesktop,
    isOpen ? styles.footerOpen : styles.footerClosed,
    className
  ].filter(Boolean).join(' ');

  return (
    <footer className={footerClasses} {...props}>
      <div className={styles.container}>
        <div className={styles.content}>
          {size === 'maxi' && (
            <>
              <div className={styles.section}>
                <div className={styles.logo}>Logo</div>
                <h3 className={styles.sectionTitle}>Company</h3>
                <nav className={styles.sectionLinks}>
                  <ul className={styles.linkList}>
                    <li className={styles.linkItem}>
                      <a href="#" className={styles.link}>About</a>
                    </li>
                    <li className={styles.linkItem}>
                      <a href="#" className={styles.link}>Careers</a>
                    </li>
                    <li className={styles.linkItem}>
                      <a href="#" className={styles.link}>Contact</a>
                    </li>
                  </ul>
                </nav>
              </div>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Products</h3>
                <nav className={styles.sectionLinks}>
                  <ul className={styles.linkList}>
                    <li className={styles.linkItem}>
                      <a href="#" className={styles.link}>Features</a>
                    </li>
                    <li className={styles.linkItem}>
                      <a href="#" className={styles.link}>Pricing</a>
                    </li>
                    <li className={styles.linkItem}>
                      <a href="#" className={styles.link}>Documentation</a>
                    </li>
                  </ul>
                </nav>
              </div>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Resources</h3>
                <nav className={styles.sectionLinks}>
                  <ul className={styles.linkList}>
                    <li className={styles.linkItem}>
                      <a href="#" className={styles.link}>Blog</a>
                    </li>
                    <li className={styles.linkItem}>
                      <a href="#" className={styles.link}>Help Center</a>
                    </li>
                    <li className={styles.linkItem}>
                      <a href="#" className={styles.link}>Community</a>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
        <div className={styles.divider} />
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            © 2024 Company Name. All rights reserved.
          </div>
          <div className={styles.socialLinks}>
            <button className={styles.iconButton} aria-label="Twitter">
              <span>Twitter</span>
            </button>
            <button className={styles.iconButton} aria-label="LinkedIn">
              <span>LinkedIn</span>
            </button>
            <button className={styles.iconButton} aria-label="GitHub">
              <span>GitHub</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
