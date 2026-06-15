import { Link } from "react-router-dom";
import styles from "../css/AdminDashboard.module.css";

export default function AdminDashboard() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Dashboard</h1>
      <p className={styles.subtitle}>Manage your store from here.</p>

      <div className={styles.grid}>
        <Link to="/admin/products" className={styles.card}>
          <h3 className={styles.cardTitle}>Manage Products</h3>
          <p className={styles.cardText}>Add, edit, or remove products and services</p>
        </Link>

        <Link to="/admin/orders" className={styles.card}>
          <h3 className={styles.cardTitle}>Manage Orders</h3>
          <p className={styles.cardText}>View and update customer orders</p>
        </Link>
      </div>
    </div>
  );
}