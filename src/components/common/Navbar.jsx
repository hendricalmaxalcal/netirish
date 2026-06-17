import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { CartContext } from "../../context/CartContext";
import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, role, loading } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>NetIrish</Link>

      <div className={styles.linksWrap}>
        <Link to="/" className={styles.link}>Home</Link>
        <Link to="/about" className={styles.link}>About</Link>

        {!loading && !user && (
          <>
            <Link to="/login" className={styles.link}>Login</Link>
            <Link to="/register" className={styles.pillBtn}>Register</Link>
          </>
        )}

        {!loading && user && role === "customer" && (
          <>
            <Link to="/dashboard" className={styles.link}>Dashboard</Link>
            <Link to="/cart" className={styles.link}>
              Cart {cartCount > 0 && `(${cartCount})`}
            </Link>
            <Link to="/profile" className={styles.link}>Profile</Link>
          </>
        )}

        {!loading && user && role === "admin" && (
          <>
            <Link to="/admin" className={styles.link}>Admin</Link>
            <Link to="/admin/products" className={styles.link}>Products</Link>
            <Link to="/admin/orders" className={styles.link}>Orders</Link>
          </>
        )}

        {!loading && user && (
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}