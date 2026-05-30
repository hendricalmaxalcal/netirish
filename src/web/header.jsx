import { useState, useRef, useEffect } from "react";
import styles from "./web.module.css";
import logo from "../assets/myIcon.jpg";

function Header() {
    const [showServices, setShowServices] = useState(false);
    const [showProducts, setShowProducts] = useState(false);

    const dropdownRef = useRef(null);

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
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.logo}>
                <img src={logo} alt="NetIrish Logo" />
                NetIrish
            </div>

            <nav className={styles.nav} ref={dropdownRef}>
                <a href="#home">Home</a>

                {/* Services Dropdown */}
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

                {/* Products Dropdown */}
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

                <a href="#about">About Us</a>
            </nav>

            <div className={styles.actions}>
                <button className={styles.secondaryBtn}>
                    Customer Care
                </button>

                <button>
                    Get Started
                </button>
            </div>
        </header>
    );
}

export default Header;