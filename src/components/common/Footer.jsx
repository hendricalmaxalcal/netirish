import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>

        {/* Brand */}
        <div className={styles.col}>
          <p className={styles.brand}>NetIrish</p>
          <p className={styles.tagline}>
            Your trusted partner for quality IT devices, accessories, and
            professional IT services in Tanzania.
          </p>
        </div>

        {/* Quick Links */}
        <div className={styles.col}>
          <h3>Quick Links</h3>
          <ul className={styles.linkList}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h3>Contact Us</h3>
          <a href="tel:+255700000000" className={styles.contactItem}>
            📞 +255 700 000 000
          </a>
          <a href="https://wa.me/255700000000" target="_blank" rel="noreferrer" className={styles.contactItem}>
            💬 WhatsApp
          </a>
          <a href="mailto:info@netirish.com" className={styles.contactItem}>
            📧 info@netirish.com
          </a>
          <span className={styles.contactItem}>
            📍 Dar es Salaam, Tanzania
          </span>
        </div>

        {/* Social Media */}
        <div className={styles.col}>
          <h3>Follow Us</h3>
          <div className={styles.socialRow}>
            <a href="https://facebook.com/netirish" target="_blank" rel="noreferrer" className={styles.socialBtn} title="Facebook">📘</a>
            <a href="https://instagram.com/netirish" target="_blank" rel="noreferrer" className={styles.socialBtn} title="Instagram">📸</a>
            <a href="https://twitter.com/netirish" target="_blank" rel="noreferrer" className={styles.socialBtn} title="Twitter/X">🐦</a>
            <a href="https://linkedin.com/company/netirish" target="_blank" rel="noreferrer" className={styles.socialBtn} title="LinkedIn">💼</a>
            <a href="https://youtube.com/@netirish" target="_blank" rel="noreferrer" className={styles.socialBtn} title="YouTube">▶️</a>
            <a href="https://tiktok.com/@netirish" target="_blank" rel="noreferrer" className={styles.socialBtn} title="TikTok">🎵</a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {year} NetIrish. All rights reserved. | <Link to="/about">About Us</Link></p>
      </div>
    </footer>
  );
}