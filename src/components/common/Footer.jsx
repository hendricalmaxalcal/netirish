import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaTiktok, FaWhatsapp, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.col}>
          <p className={styles.brand}>NetIrish</p>
          <p className={styles.tagline}>
            Your trusted partner for quality IT devices, accessories, and
            professional IT services in Tanzania.
          </p>
        </div>

        <div className={styles.col}>
          <h3>Quick Links</h3>
          <ul className={styles.linkList}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>

        <div className={styles.col}>
          <h3>Contact Us</h3>
          <a href="tel:+255685635835" className={styles.contactItem}>
            <FaPhone size={14} color="#00c6ff" /> +255 685 635 835
          </a>
          <a href="https://wa.me/255685635835" target="_blank" rel="noreferrer" className={styles.contactItem}>
            <FaWhatsapp size={14} color="#25D366" /> WhatsApp
          </a>
          <a href="mailto:netirishcompany@gmail.com" className={styles.contactItem}>
            <MdEmail size={14} color="#EA4335" /> netirishcompany@gmail.com
          </a>
          <span className={styles.contactItem}>
            <FaMapMarkerAlt size={14} color="#EA4335" /> Dar es Salaam, Tanzania
          </span>
        </div>

        <div className={styles.col}>
          <h3>Follow Us</h3>
          <div className={styles.socialRow}>
            <a href="https://facebook.com/netirish" target="_blank" rel="noreferrer" className={styles.socialBtn} title="Facebook">
              <FaFacebook size={18} color="#1877F2" />
            </a>
            <a href="https://instagram.com/netirish" target="_blank" rel="noreferrer" className={styles.socialBtn} title="Instagram">
              <FaInstagram size={18} color="#E1306C" />
            </a>
            <a href="https://twitter.com/netirish" target="_blank" rel="noreferrer" className={styles.socialBtn} title="Twitter/X">
              <FaXTwitter size={18} color="#fff" />
            </a>
            <a href="https://linkedin.com/company/netirish" target="_blank" rel="noreferrer" className={styles.socialBtn} title="LinkedIn">
              <FaLinkedin size={18} color="#0A66C2" />
            </a>
            <a href="https://youtube.com/@netirish" target="_blank" rel="noreferrer" className={styles.socialBtn} title="YouTube">
              <FaYoutube size={18} color="#FF0000" />
            </a>
            <a href="https://tiktok.com/@netirish" target="_blank" rel="noreferrer" className={styles.socialBtn} title="TikTok">
              <FaTiktok size={18} color="#fff" />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© {year} NetIrish. All rights reserved. </p>
      </div>
    </footer>
  );
}