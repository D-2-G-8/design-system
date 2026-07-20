import React, { useState } from 'react';
import styles from './Navbar.module.css';

export interface NavbarProps {
  device: 'desktop' | 'mobile';
}

export const Navbar: React.FC<NavbarProps> = ({ device }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  if (device === 'desktop') {
    return (
      <nav className={`${styles.navbar} ${styles.navbarDesktop}`}>
        <div className={styles.container}>
          <div className={styles.logo}>Logo</div>
          <div className={styles.navigation}>
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <a href="#" className={styles.navLink}>Home</a>
              </li>
              <li className={styles.navItem}>
                <a href="#" className={styles.navLink}>About</a>
              </li>
              <li className={styles.navItem}>
                <a href="#" className={styles.navLink}>Services</a>
              </li>
              <li className={styles.navItem}>
                <a href="#" className={styles.navLink}>Contact</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={`${styles.navbar} ${styles.navbarMobile}`}>
      <div className={styles.container}>
        <div className={styles.logo}>Logo</div>
        <button 
          className={styles.menuButton}
          onClick={handleMenuToggle}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={styles.menuIcon}></span>
        </button>
      </div>
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <a href="#" className={styles.navLink}>Home</a>
          </li>
          <li className={styles.navItem}>
            <a href="#" className={styles.navLink}>About</a>
          </li>
          <li className={styles.navItem}>
            <a href="#" className={styles.navLink}>Services</a>
          </li>
          <li className={styles.navItem}>
            <a href="#" className={styles.navLink}>Contact</a>
          </li>
        </ul>
      </div>
      {isMobileMenuOpen && (
        <div 
          className={styles.overlay} 
          onClick={handleOverlayClick}
        />
      )}
    </nav>
  );
};
