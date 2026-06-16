import { useContext, useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { AuthContext } from "../../context/AuthContext";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import ProductCard from "../../components/common/ProductCard";
import styles from "../css/CustomerDashboard.module.css";

const SUBCATEGORIES = [
  { value: "all", label: "All" },
  { value: "computers_laptops", label: "Computers & Laptops" },
  { value: "phones", label: "Phones" },
  { value: "accessories", label: "Accessories" },
  { value: "routers", label: "Routers" },
];

const STATUS_BADGE = {
  pending: "statusBadgePending",
  processing: "statusBadgeProcessing",
  completed: "statusBadgeCompleted",
  cancelled: "statusBadgeCancelled",
};

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("status", "==", "active"),
      where("category", "==", "product")
    );
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

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

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const isSearching = searchQuery.trim().length > 0;
  const searchLower = searchQuery.toLowerCase();

  // Search results
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

  // Filter by sub-category
  const filteredProducts = subCategoryFilter === "all"
    ? products
    : products.filter((p) => p.subCategory === subCategoryFilter);

  // Group by brand
  const groupedByBrand = filteredProducts.reduce((acc, product) => {
    const brand = product.brand || "Other";
    if (!acc[brand]) acc[brand] = [];
    acc[brand].push(product);
    return acc;
  }, {});

  const sortedBrands = Object.keys(groupedByBrand).sort();

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>My Dashboard</h1>
      {user && (
        <p className={styles.welcome}>
          Welcome back, {user.displayName || user.email}
        </p>
      )}

      {/* Search Bar */}
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim().length > 0) {
              setActiveTab("products");
            }
          }}
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
              <>
                Found <span>{totalSearchResults}</span> result
                {totalSearchResults !== 1 ? "s" : ""} for "
                <span>{searchQuery}</span>"
              </>
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
            <button
              onClick={() => setActiveTab("orders")}
              className={`${styles.tabBtn} ${activeTab === "orders" ? styles.tabBtnActive : ""}`}
            >
              My Orders ({orders.length})
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

              {sortedBrands.length === 0 ? (
                <p className={styles.mutedText}>No products found.</p>
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

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div>
              {orders.length === 0 ? (
                <p className={styles.mutedText}>
                  You haven't placed any orders yet.
                </p>
              ) : (
                <div className={styles.ordersList}>
                  {orders.map((order) => (
                    <div key={order.id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <div>
                          <p className={styles.orderId}>
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className={styles.orderDate}>
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <span
                          className={
                            styles[
                              STATUS_BADGE[order.status] || "statusBadgePending"
                            ]
                          }
                        >
                          {order.status}
                        </span>
                      </div>

                      <div className={styles.itemsList}>
                        {order.items?.map((item, idx) => (
                          <div key={idx} className={styles.itemRow}>
                            <span>{item.name} × {item.qty}</span>
                            <span>
                              Tsh {Number(item.price * item.qty).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className={styles.orderFooter}>
                        <p className={styles.total}>
                          Total: Tsh {Number(order.total).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}