import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import ProductCard from "../components/common/ProductCard";
import styles from "./css/Home.module.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "products"), where("status", "==", "active"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  const filteredProducts =
    filter === "all" ? products : products.filter((p) => p.category === filter);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Welcome to NetIrish</h1>
        <p className={styles.heroSubtitle}>
          Quality products and services, delivered with excellence.
        </p>
        <a href="#products" className={styles.heroBtn}>Shop Now</a>
      </section>

      <section id="products" className={styles.productsSection}>
        <h2 className={styles.sectionTitle}>Our Offerings</h2>

        <div className={styles.filterRow}>
          <button
            onClick={() => setFilter("all")}
            className={`${styles.filterBtn} ${filter === "all" ? styles.filterBtnActive : ""}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("product")}
            className={`${styles.filterBtn} ${filter === "product" ? styles.filterBtnActive : ""}`}
          >
            Products
          </button>
          <button
            onClick={() => setFilter("service")}
            className={`${styles.filterBtn} ${filter === "service" ? styles.filterBtnActive : ""}`}
          >
            Services
          </button>
        </div>

        {loading ? (
          <p className={styles.mutedText}>Loading...</p>
        ) : filteredProducts.length === 0 ? (
          <p className={styles.mutedText}>No items available right now.</p>
        ) : (
          <div className={styles.grid}>
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}