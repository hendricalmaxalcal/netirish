import { useContext, useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { AuthContext } from "../../context/AuthContext";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import ProductCard from "../../components/common/ProductCard";

const SUBCATEGORIES = [
  { value: "computers_laptops", label: "Computers & Laptops" },
  { value: "phones", label: "Phones" },
  { value: "accessories", label: "Accessories" },
  { value: "routers", label: "Routers" },
];

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("products");

  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [orders, setOrders] = useState([]);

  const [subCategoryFilter, setSubCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");

  // Fetch active products
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

  // Fetch user's orders
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

  // Derive available brands from current sub-category filter
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

  const subCategoryLabel = (value) =>
    SUBCATEGORIES.find((s) => s.value === value)?.label || value;

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>My Dashboard</h1>
      {user && <p style={welcomeStyle}>Welcome back, {user.displayName || user.email}</p>}

      {/* Tabs */}
      <div style={tabsStyle}>
        <button onClick={() => setActiveTab("products")} style={tabBtn(activeTab === "products")}>
          Products
        </button>
        <button onClick={() => setActiveTab("services")} style={tabBtn(activeTab === "services")}>
          Services
        </button>
        <button onClick={() => setActiveTab("orders")} style={tabBtn(activeTab === "orders")}>
          My Orders ({orders.length})
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          <div style={filterRowStyle}>
            <div>
              <label style={filterLabelStyle}>Category</label>
              <select
                value={subCategoryFilter}
                onChange={(e) => {
                  setSubCategoryFilter(e.target.value);
                  setBrandFilter("all");
                }}
                style={selectStyle}
              >
                <option value="all">All Categories</option>
                {SUBCATEGORIES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={filterLabelStyle}>Brand</label>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="all">All Brands</option>
                {availableBrands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <p style={mutedTextStyle}>No products found for this filter.</p>
          ) : (
            <div style={gridStyle}>
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Services Tab */}
      {activeTab === "services" && (
        <div>
          {services.length === 0 ? (
            <p style={mutedTextStyle}>No services available right now.</p>
          ) : (
            <div style={gridStyle}>
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
            <p style={mutedTextStyle}>You haven't placed any orders yet.</p>
          ) : (
            <div style={ordersListStyle}>
              {orders.map((order) => (
                <div key={order.id} style={orderCardStyle}>
                  <div style={orderHeaderStyle}>
                    <div>
                      <p style={orderIdStyle}>Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p style={orderDateStyle}>{formatDate(order.createdAt)}</p>
                    </div>
                    <span style={statusBadge(order.status)}>{order.status}</span>
                  </div>

                  <div style={itemsListStyle}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} style={itemRowStyle}>
                        <span>{item.name} × {item.qty}</span>
                        <span>Tsh {Number(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div style={orderFooterStyle}>
                    <p style={totalStyle}>Total: Tsh {Number(order.total).toLocaleString()}</p>
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

/* ---------- Styles ---------- */

const pageStyle = {
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#0d0d0f",
  color: "#fff",
  fontFamily: "'Segoe UI', sans-serif",
  padding: "40px 30px",
};

const titleStyle = {
  fontSize: "2.2rem",
  fontWeight: "800",
  marginBottom: "8px",
  background: "linear-gradient(90deg, #00c6ff, #7b2ff7)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const welcomeStyle = {
  color: "#9a9aae",
  marginBottom: "30px",
};

const tabsStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "30px",
  borderBottom: "1px solid #2a2a3a",
  paddingBottom: "10px",
};

const tabBtn = (active) => ({
  padding: "10px 22px",
  borderRadius: "20px",
  border: "1px solid #2a2a3a",
  background: active ? "linear-gradient(90deg, #00c6ff, #7b2ff7)" : "transparent",
  color: active ? "#fff" : "#ccc",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.9rem",
});

const filterRowStyle = {
  display: "flex",
  gap: "20px",
  marginBottom: "30px",
  flexWrap: "wrap",
};

const filterLabelStyle = {
  display: "block",
  color: "#9a9aae",
  fontSize: "0.85rem",
  marginBottom: "6px",
  fontWeight: "600",
};

const selectStyle = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #2a2a3a",
  background: "#1a1a24",
  color: "#fff",
  fontSize: "0.9rem",
  cursor: "pointer",
  minWidth: "200px",
};

const gridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "24px",
};

const mutedTextStyle = {
  color: "#888",
};

const ordersListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  maxWidth: "700px",
};

const orderCardStyle = {
  background: "#1a1a24",
  border: "1px solid #2a2a3a",
  borderRadius: "12px",
  padding: "20px",
};

const orderHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "16px",
  paddingBottom: "16px",
  borderBottom: "1px solid #2a2a3a",
};

const orderIdStyle = {
  margin: 0,
  fontWeight: "700",
  fontSize: "1rem",
};

const orderDateStyle = {
  margin: "4px 0 0",
  color: "#9a9aae",
  fontSize: "0.85rem",
};

const itemsListStyle = {
  marginBottom: "16px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const itemRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "0.9rem",
  color: "#ddd",
  padding: "4px 0",
};

const orderFooterStyle = {
  paddingTop: "16px",
  borderTop: "1px solid #2a2a3a",
};

const totalStyle = {
  margin: 0,
  fontWeight: "700",
  fontSize: "1.1rem",
  color: "#00c6ff",
};

const statusBadge = (status) => {
  const colors = {
    pending: { bg: "#3a3a1a", color: "#ffd76b" },
    processing: { bg: "#1a2a3a", color: "#6bc6ff" },
    completed: { bg: "#1a3a1a", color: "#6bff6b" },
    cancelled: { bg: "#3a1a1a", color: "#ff6b6b" },
  };
  const c = colors[status] || colors.pending;
  return {
    background: c.bg,
    color: c.color,
    padding: "5px 14px",
    borderRadius: "12px",
    fontSize: "0.8rem",
    fontWeight: "600",
    textTransform: "capitalize",
  };
};