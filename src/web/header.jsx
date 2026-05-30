import { useState, useRef, useEffect } from "react";
import styles from "./web.module.css";
import logo from "../assets/myIcon.jpg";

function Header() {
    const [showServices, setShowServices] = useState(false);
    const [showProducts, setShowProducts] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const dropdownRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowServices(false);
                setShowProducts(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className={styles.header}>
            {/* LOGO + HAMBURGER */}
            <div className={styles.leftSection}>
                <div className={styles.logo}>
                    <img src={logo} alt="NetIrish Logo" />
                    NetIrish
                </div>

                <div
                    className={styles.hamburger}
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    ☰
                </div>
            </div>

            {/* NAV */}
            <nav
                className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`}
                ref={dropdownRef}
            >
                <a href="#home" onClick={() => setMenuOpen(false)}>
                    Home
                </a>

                {/* SERVICES */}
                <div className={styles.dropdown}>
                    <button
                        className={styles.navBtn}
                        onClick={() => {
                            setShowServices(!showServices);
                            setShowProducts(false);
                        }}
                    >
                        Services
                    </button>

                    {showServices && (
                        <div className={styles.dropdownMenu}>
                            <a href="#webdev">Web Development</a>
                            <a href="#security">Cyber Security</a>
                            <a href="#networking">Networking</a>
                            <a href="#consulting">IT Consulting</a>
                        </div>
                    )}
                </div>

                {/* PRODUCTS */}
                <div className={styles.dropdown}>
                    <button
                        className={styles.navBtn}
                        onClick={() => {
                            setShowProducts(!showProducts);
                            setShowServices(false);
                        }}
                    >
                        Products
                    </button>

                    {showProducts && (
                        <div className={styles.dropdownMenu}>
                            <a href="#computer">Computer & Laptop</a>
                            <a href="#accessories">Computer Accessories</a>
                            <a href="#phone">Phone</a>
                            <a href="#router">Internet Router</a>
                        </div>
                    )}
                </div>

                <a href="#about" onClick={() => setMenuOpen(false)}>
                    About Us
                </a>
            </nav>

            {/* ACTION BUTTONS */}
            <div className={styles.actions}>
                <button className={styles.secondaryBtn}>
                    Customer Care
                </button>

                <button>Get Started</button>
            </div>
        </header>
    );
}

export default Header;