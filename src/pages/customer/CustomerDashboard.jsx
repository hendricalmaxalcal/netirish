import { useContext, useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { AuthContext } from "../../context/AuthContext";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import ProductCard from "../../components/common/ProductCard";
import styles from "../css/CustomerDashboard.module.css";

const SUBCATEGORIES = [
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
  const [brandFilter, setBrandFilter] = useState("all");

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

  const availableBrands = Array.from(
    new Set(
      products
        .filter((p) => subCategoryFilter === "all" || p.subCategory === subCategoryFilter)
        .map((p) => p.brand)
        .filter(Boolean)
    )
  );

  const filteredProducts = products.filter((p) => {
    if (subCategoryFilter !== "all" && p.subCategory !== subCategoryFilter) return false;
    if (brandFilter !== "all" && p.brand !== brandFilter) return false;
    return true;
  });

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

      {activeTab === "products" && (
        <div>
          <div className={styles.filterRow}>
            <div>
              <label className={styles.filterLabel}>Category</label>
              <select
                value={subCategoryFilter}
                onChange={(e) => {
                  setSubCategoryFilter(e.target.value);
                  setBrandFilter("all");
                }}
                className={styles.select}
              >
                <option value="all">All Categories</option>
                {SUBCATEGORIES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={styles.filterLabel}>Brand</label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className={styles.select}
              >
                <option value="all">All Brands</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <p className={styles.mutedText}>No products found for this filter.</p>
          ) : (
            <div className={styles.grid}>
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "services" && (
        <div>
          {services.length === 0 ? (
            <p className={styles.mutedText}>No services available right now.</p>
          ) : (
            <div className={styles.grid}>
              {services.map((s) => (
                <ProductCard key={s.id} product={s} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <p className={styles.mutedText}>You haven't placed any orders yet.</p>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <div>
                      <p className={styles.orderId}>
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={styles[STATUS_BADGE[order.status] || "statusBadgePending"]}>
                      {order.status}
                    </span>
                  </div>

                  <div className={styles.itemsList}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className={styles.itemRow}>
                        <span>{item.name} × {item.qty}</span>
                        <span>Tsh {Number(item.price * item.qty).toLocaleString()}</span>
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
    </div>
  );
}