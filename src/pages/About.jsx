import styles from "./css/About.module.css";

export default function About() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>About NetIrish</h1>
        <p className={styles.heroSubtitle}>
          Your trusted partner for quality IT devices, accessories, and
          professional IT services in Tanzania. We are committed to delivering
          excellence and innovation to every customer.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Who We Are</h2>
        <p className={styles.aboutText}>
          NetIrish is a leading IT solutions provider based in Dar es Salaam,
          Tanzania. We specialize in selling high-quality computers, laptops,
          phones, routers, and accessories from top global brands including
          HP, Dell, Samsung, Apple, TP-Link, and more.
        </p>
        <p className={styles.aboutText}>
          Beyond selling devices, we offer professional IT services including
          network setup, device repair, software installation, and technical
          support. Our team of experienced technicians is dedicated to keeping
          your technology running smoothly.
        </p>
        <p className={styles.aboutText}>
          Whether you are an individual, a small business, or a large
          organization, NetIrish has the right technology solution for you.
        </p>

        <hr className={styles.divider} />

        <h2 className={styles.sectionTitle}>Contact Us</h2>
        <div className={styles.contactGrid}>

          <div className={styles.contactCard}>
            <span className={styles.contactIcon}>📞</span>
            <div>
              <p className={styles.contactLabel}>Phone</p>
              <a href="tel:+255700000000" className={styles.contactValue}>
                +255 700 000 000
              </a>
            </div>
          </div>

          <div className={styles.contactCard}>
            <span className={styles.contactIcon}>💬</span>
            <div>
              <p className={styles.contactLabel}>WhatsApp</p>
              <a href="https://wa.me/255700000000" target="_blank" rel="noreferrer" className={styles.contactValue}>
                +255 700 000 000
              </a>
            </div>
          </div>

          <div className={styles.contactCard}>
            <span className={styles.contactIcon}>📧</span>
            <div>
              <p className={styles.contactLabel}>Email</p>
              <a href="mailto:info@netirish.com" className={styles.contactValue}>
                info@netirish.com
              </a>
            </div>
          </div>

          <div className={styles.contactCard}>
            <span className={styles.contactIcon}>📍</span>
            <div>
              <p className={styles.contactLabel}>Address</p>
              <span className={styles.contactValue}>
                Dar es Salaam, Tanzania
              </span>
            </div>
          </div>

        </div>

        <hr className={styles.divider} />

        <h2 className={styles.sectionTitle}>Follow Us</h2>
        <div className={styles.socialGrid}>

          <a href="https://facebook.com/netirish" target="_blank" rel="noreferrer" className={styles.socialCard}>
            <span className={styles.socialIcon}>📘</span>
            Facebook
          </a>

          <a href="https://instagram.com/netirish" target="_blank" rel="noreferrer" className={styles.socialCard}>
            <span className={styles.socialIcon}>📸</span>
            Instagram
          </a>

          <a href="https://twitter.com/netirish" target="_blank" rel="noreferrer" className={styles.socialCard}>
            <span className={styles.socialIcon}>🐦</span>
            Twitter / X
          </a>

          <a href="https://linkedin.com/company/netirish" target="_blank" rel="noreferrer" className={styles.socialCard}>
            <span className={styles.socialIcon}>💼</span>
            LinkedIn
          </a>

          <a href="https://youtube.com/@netirish" target="_blank" rel="noreferrer" className={styles.socialCard}>
            <span className={styles.socialIcon}>▶️</span>
            YouTube
          </a>

          <a href="https://tiktok.com/@netirish" target="_blank" rel="noreferrer" className={styles.socialCard}>
            <span className={styles.socialIcon}>🎵</span>
            TikTok
          </a>

        </div>
      </section>
    </div>
  );
}