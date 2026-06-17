
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { db, auth } from "../../firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import {
  deleteUser,
  signOut,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import styles from "../css/Profile.module.css";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setEditForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            phone: data.phone || "",
          });
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      where("status", "in", ["pending", "processing"]),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [user]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
      });
      await updateProfile(auth.currentUser, {
        displayName: `${editForm.firstName} ${editForm.lastName}`,
      });
      setUserData((prev) => ({ ...prev, ...editForm }));
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      setError("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setError("Please enter your password to confirm deletion.");
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const currentUser = auth.currentUser;

      // Re-authenticate first to ensure fresh session
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        deletePassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Delete Firestore document
      await deleteDoc(doc(db, "users", currentUser.uid));

      // Delete Firebase Auth account
      await deleteUser(currentUser);

      // Clear cart
      localStorage.removeItem("cart");

      // Redirect to home
      navigate("/");
    } catch (err) {
      console.error("Delete error:", err.code, err.message);

      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError("Failed to delete account: " + err.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const getInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "?";
  };

  if (!userData) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <p style={{ color: "#9a9aae" }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.page}>
        <div className={styles.inner}>
          <h1 className={styles.title}>My Profile</h1>

          {success && <p className={styles.successMsg}>{success}</p>}
          {error && <p className={styles.error}>{error}</p>}

          {/* Avatar + Info */}
          <div className={styles.card}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar}>{getInitials()}</div>
              <div>
                <h2 className={styles.avatarName}>
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className={styles.avatarRole}>{userData.role}</p>
              </div>
            </div>

            {!editing ? (
              <>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>First Name</span>
                  <span className={styles.fieldValue}>{userData.firstName}</span>
                </div>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Last Name</span>
                  <span className={styles.fieldValue}>{userData.lastName}</span>
                </div>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Email</span>
                  <span className={styles.fieldValue}>{userData.email}</span>
                </div>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Phone</span>
                  <span className={styles.fieldValue}>
                    {userData.phone || "—"}
                  </span>
                </div>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Gender</span>
                  <span
                    className={styles.fieldValue}
                    style={{ textTransform: "capitalize" }}
                  >
                    {userData.gender?.replace("_", " ") || "—"}
                  </span>
                </div>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>Age</span>
                  <span className={styles.fieldValue}>
                    {userData.age || "—"}
                  </span>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <button
                    onClick={() => setEditing(true)}
                    className={styles.btn}
                  >
                    Edit Profile
                  </button>
                </div>
              </>
            ) : (
              <>
                <label className={styles.label}>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={editForm.firstName}
                  onChange={handleEditChange}
                  className={styles.input}
                />

                <label className={styles.label}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={editForm.lastName}
                  onChange={handleEditChange}
                  className={styles.input}
                />

                <label className={styles.label}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className={styles.input}
                  placeholder="+255700000000"
                />

                <div className={styles.editActions}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={styles.btn}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setError("");
                    }}
                    className={styles.outlineBtn}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Uncompleted Orders */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              Uncompleted Orders ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <p className={styles.mutedText}>
                No pending or processing orders.
              </p>
            ) : (
              orders.map((order) => (
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
                        order.status === "pending"
                          ? styles.statusPending
                          : styles.statusProcessing
                      }
                    >
                      {order.status}
                    </span>
                  </div>

                  {order.items?.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <span>
                        {item.name} × {item.qty}
                      </span>
                      <span>
                        Tsh {Number(item.price * item.qty).toLocaleString()}
                      </span>
                    </div>
                  ))}

                  <p className={styles.orderTotal}>
                    Total: Tsh {Number(order.total).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Delete Account */}
          <div className={styles.card}>
            <div className={styles.deleteSection}>
              <h3 className={styles.deleteTitle}>Delete Account</h3>
              <p className={styles.deleteText}>
                Permanently delete your account and all associated data.
                This action cannot be undone.
              </p>
              <button
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setDeletePassword("");
                  setError("");
                }}
                className={styles.deleteBtn}
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className={styles.confirmOverlay}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className={styles.confirmModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.confirmIcon}>⚠️</div>
            <h3 className={styles.confirmTitle}>Delete Account?</h3>
            <p className={styles.confirmText}>
              Enter your password to confirm. This will permanently delete
              your account and profile. Your order history will remain for
              admin records. This cannot be undone.
            </p>

            {error && (
              <p
                style={{
                  background: "#3a1a1a",
                  color: "#ff6b6b",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  marginBottom: "16px",
                  border: "1px solid #5a2a2a",
                }}
              >
                {error}
              </p>
            )}

            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                width: "100%",
                padding: "10px 14px",
                marginBottom: "16px",
                borderRadius: "8px",
                border: "1px solid #2a2a3a",
                background: "#0d0d0f",
                color: "#fff",
                fontSize: "0.95rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <div className={styles.confirmActions}>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className={styles.deleteBtn}
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword("");
                  setError("");
                }}
                className={styles.outlineBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
