import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import styles from "../css/ManageOrders.module.css";

const STATUS_OPTIONS = ["pending", "processing", "completed", "cancelled"];

const STATUS_CLASS = {
  pending: "statusPending",
  processing: "statusProcessing",
  completed: "statusCompleted",
  cancelled: "statusCancelled",
};

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

  const handleDelete = async (orderId) => {
    if (confirm("Delete this order permanently?")) {
      await deleteDoc(doc(db, "orders", orderId));
    }
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Manage Orders</h1>

      <div className={styles.filterRow}>
        <button
          onClick={() => setFilter("all")}
          className={`${styles.filterBtn} ${filter === "all" ? styles.filterBtnActive : ""}`}
        >
          All ({orders.length})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`${styles.filterBtn} ${filter === s ? styles.filterBtnActive : ""}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)} (
            {orders.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <p className={styles.emptyText}>No orders found.</p>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders.map((order) => {
            const canDelete =
              order.status === "completed" || order.status === "cancelled";

            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderHeader}>
                  <div>
                    <p className={styles.orderId}>
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={styles[STATUS_CLASS[order.status] || "statusPending"]}>
                    {order.status}
                  </span>
                </div>

                <div className={styles.customerInfo}>
                  <p><strong>Customer:</strong> {order.customerName || "—"}</p>
                  <p><strong>Email:</strong> {order.customerEmail || "—"}</p>
                  {order.customerPhone && (
                    <p><strong>Phone:</strong> {order.customerPhone}</p>
                  )}
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

                  <div className={styles.footerActions}>
                    <label className={styles.statusLabel}>Update status:</label>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={styles.select}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(order.id)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}