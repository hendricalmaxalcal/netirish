import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import ProductCard from "../components/common/ProductCard";
import styles from "./css/Home.module.css";

const SUBCATEGORIES = [
  { value: "all", label: "All" },
  { value: "computers_laptops", label: "Computers & Laptops" },
  { value: "phones", label: "Phones" },
  { value: "accessories", label: "Accessories" },
  { value: "routers", label: "Routers" },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("products");
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");

  // Fetch active products
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("status", "==", "active"),
      where("category", "==", "product")
    );
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching products:", err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Fetch active services
  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("status", "==", "active"),
      where("category", "==", "service")
    );
    const unsub = onSnapshot(q, (snap) => {
      setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  // Filter products by sub-category
  const filteredProducts = subCategoryFilter === "all"
    ? products
    : products.filter((p) => p.subCategory === subCategoryFilter);

  // Group filtered products by brand
  const groupedByBrand = filteredProducts.reduce((acc, product) => {
    const brand = product.brand || "Other";
    if (!acc[brand]) acc[brand] = [];
    acc[brand].push(product);
    return acc;
  }, {});

  // Sort brands alphabetically
  const sortedBrands = Object.keys(groupedByBrand).sort();

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Welcome to NetIrish</h1>
        <p className={styles.heroSubtitle}>
          Quality IT devices, accessories and services, delivered with excellence.
        </p>
        <a href="#offerings" className={styles.heroBtn}>Shop Now</a>
      </section>

      {/* Main Section */}
      <section id="offerings" className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Offerings</h2>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            onClick={() => setActiveTab("products")}
            className={`${styles.tabBtn} ${activeTab === "products" ? styles.tabBtnActive : ""}`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`${styles.tabBtn} ${activeTab === "services" ? styles.tabBtnActive : ""}`}
          >
            Services
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            {/* Sub-category filter */}
            <div className={styles.subCategoryFilter}>
              {SUBCATEGORIES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSubCategoryFilter(s.value)}
                  className={`${styles.filterBtn} ${subCategoryFilter === s.value ? styles.filterBtnActive : ""}`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {loading ? (
              <p className={styles.mutedText}>Loading...</p>
            ) : sortedBrands.length === 0 ? (
              <p className={styles.mutedText}>No products available right now.</p>
            ) : (
              sortedBrands.map((brand) => (
                <div key={brand} className={styles.brandSection}>
                  <h3 className={styles.brandHeading}>{brand}</h3>
                  <div className={styles.grid}>
                    {groupedByBrand[brand].map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div>
            {services.length === 0 ? (
              <p className={styles.mutedText}>No services available right now.</p>
            ) : (
              <div className={styles.servicesGrid}>
                {services.map((s) => (
                  <ProductCard key={s.id} product={s} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}