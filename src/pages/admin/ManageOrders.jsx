import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";

const STATUS_OPTIONS = ["pending", "processing", "completed", "cancelled"];

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    await updateDoc(doc(db, "orders", orderId), { status: newStatus });
  };

  const filteredOrders = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Manage Orders</h1>

      <div style={filterRowStyle}>
        <button onClick={() => setFilter("all")} style={filterBtn(filter === "all")}>
          All ({orders.length})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button key={s} onClick={() => setFilter(s)} style={filterBtn(filter === s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p style={{ color: "#9a9aae" }}>No orders found.</p>
      ) : (
        <div style={ordersListStyle}>
          {filteredOrders.map((order) => (
            <div key={order.id} style={orderCardStyle}>
              <div style={orderHeaderStyle}>
                <div>
                  <p style={orderIdStyle}>Order #{order.id.slice(0, 8).toUpperCase()}</p>
                  <p style={orderDateStyle}>{formatDate(order.createdAt)}</p>
                </div>
                <span style={statusBadge(order.status)}>{order.status}</span>
              </div>

              <div style={customerInfoStyle}>
                <p><strong>Customer:</strong> {order.customerName || "—"}</p>
                <p><strong>Email:</strong> {order.customerEmail || "—"}</p>
                {order.customerPhone && <p><strong>Phone:</strong> {order.customerPhone}</p>}
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

                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <label style={{ color: "#9a9aae", fontSize: "0.85rem" }}>Update status:</label>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    style={selectStyle}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
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
  marginBottom: "30px",
  background: "linear-gradient(90deg, #00c6ff, #7b2ff7)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const filterRowStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "30px",
  flexWrap: "wrap",
};

const filterBtn = (active) => ({
  padding: "8px 18px",
  borderRadius: "20px",
  border: "1px solid #2a2a3a",
  background: active ? "linear-gradient(90deg, #00c6ff, #7b2ff7)" : "transparent",
  color: active ? "#fff" : "#ccc",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "0.85rem",
});

const ordersListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  maxWidth: "800px",
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

const customerInfoStyle = {
  marginBottom: "16px",
  fontSize: "0.9rem",
  color: "#ccc",
  display: "flex",
  flexDirection: "column",
  gap: "4px",
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
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "10px",
  paddingTop: "16px",
  borderTop: "1px solid #2a2a3a",
};

const totalStyle = {
  margin: 0,
  fontWeight: "700",
  fontSize: "1.1rem",
  color: "#00c6ff",
};

const selectStyle = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "1px solid #2a2a3a",
  background: "#0d0d0f",
  color: "#fff",
  fontSize: "0.85rem",
  cursor: "pointer",
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