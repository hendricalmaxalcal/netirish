import styles from "./footer.module.css";
import { MdPhone, MdEmail } from "react-icons/md";
import { FaFacebook, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";

function Footer() {
    return (
        <footer className={styles.footer}>
            <hr />
            <div className={styles.footerContent}>
                <div className={styles.footerCenter}>
                    <p>
                        <MdPhone /> +255 685 635 835
                    </p>
                    <p>
                         © {new Date().getFullYear()} NetIrish. All Rights Reserved.</p>
                    <p>
                        <MdEmail /> hendricalmaxalcal@gmail.com 
                    </p>
                </div>

                <div className={styles.footerRight}>
                    <a href="#"><FaWhatsapp /></a>
                    <a href="#"><FaInstagram /></a>
                    <a href="#"><FaFacebook /></a>
                    <a href="#"><FaLinkedin /></a>
                </div>

                <div className={styles.footerLeft}>
                    <h3>NetIrish</h3>
                    <p>Reliable IT Solutions & Services</p>
                </div>
            </div>

        </footer>
    );
}

export default Footer;