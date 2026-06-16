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
  const [searchQuery, setSearchQuery] = useState("");

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

  const isSearching = searchQuery.trim().length > 0;
  const searchLower = searchQuery.toLowerCase();

  // Search results across both products and services
  const searchedProducts = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchLower) ||
      p.brand?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.subCategory?.toLowerCase().includes(searchLower)
  );

  const searchedServices = services.filter(
    (s) =>
      s.name?.toLowerCase().includes(searchLower) ||
      s.description?.toLowerCase().includes(searchLower)
  );

  const totalSearchResults = searchedProducts.length + searchedServices.length;

  // Filter products by sub-category (when not searching)
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

  const sortedBrands = Object.keys(groupedByBrand).sort();

  return (
    <div className={styles.page}>
      {/* Hero */}
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

        {/* Search Bar */}
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products, services, brands..."
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              className={styles.clearBtn}
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Search Results */}
        {isSearching ? (
          <div className={styles.searchResults}>
            <p className={styles.searchResultsTitle}>
              {totalSearchResults > 0 ? (
                <>Found <span>{totalSearchResults}</span> result{totalSearchResults !== 1 ? "s" : ""} for "<span>{searchQuery}</span>"</>
              ) : (
                <>No results found for "<span>{searchQuery}</span>"</>
              )}
            </p>

            {totalSearchResults === 0 ? (
              <p className={styles.noResults}>
                Try searching for a different product, service, or brand name.
              </p>
            ) : (
              <>
                {searchedProducts.length > 0 && (
                  <>
                    <p className={styles.searchCategory}>
                      Products ({searchedProducts.length})
                    </p>
                    <div className={styles.searchResultsGrid}>
                      {searchedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  </>
                )}

                {searchedServices.length > 0 && (
                  <>
                    <p className={styles.searchCategory}>
                      Services ({searchedServices.length})
                    </p>
                    <div className={styles.searchResultsGrid}>
                      {searchedServices.map((s) => (
                        <ProductCard key={s.id} product={s} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        ) : (
          <>
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
          </>
        )}
      </section>
    </div>
  );
}