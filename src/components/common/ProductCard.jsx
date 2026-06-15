import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [added, setAdded] = useState(false);

  const isService = product.category === "service";

  const buildItem = (extra = {}) => ({
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    qty: 1,
    category: product.category,
    imageUrl: product.imageUrl || "",
    ...extra,
  });

  const handleAddClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (isService) {
      setShowServiceModal(true);
    } else {
      addToCart(buildItem());
      flashAdded();
    }
  };

  const handleServiceSubmit = () => {
    addToCart(
      buildItem({
        notes: notes.trim(),
        preferredDate: preferredDate || null,
      })
    );
    setShowServiceModal(false);
    setNotes("");
    setPreferredDate("");
    flashAdded();
  };

  const flashAdded = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const goToAuth = (path) => {
    const pendingItem = isService
      ? buildItem({ notes: notes.trim(), preferredDate: preferredDate || null })
      : buildItem();

    localStorage.setItem("pendingCartItem", JSON.stringify(pendingItem));
    setShowAuthModal(false);
    setShowServiceModal(false);
    navigate(path);
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className={styles.image} />
          ) : (
            <div className={styles.placeholder}>No Image</div>
          )}
        </div>
        <div className={styles.content}>
          <span className={styles.badge}>{product.category}</span>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.desc}>{product.description}</p>
          <p className={styles.price}>Tsh {Number(product.price).toLocaleString()}</p>

          <button onClick={handleAddClick} className={styles.addBtn}>
            {added ? "Added ✓" : isService ? "Request Service" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Auth required modal */}
      {showAuthModal && (
        <div className={styles.overlay} onClick={() => setShowAuthModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Login Required</h3>
            <p className={styles.modalText}>
              Please login or create an account to {isService ? "request this service" : "add items to your cart"}.
            </p>

            <div className={styles.modalActions}>
              <button onClick={() => goToAuth("/login")} className={styles.addBtn}>
                Login
              </button>
              <button onClick={() => goToAuth("/register")} className={styles.cancelBtn}>
                Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service request modal */}
      {showServiceModal && (
        <div className={styles.overlay} onClick={() => setShowServiceModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Request: {product.name}</h3>

            <label className={styles.label}>Preferred Date (optional)</label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className={styles.input}
            />

            <label className={styles.label}>Details / Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what you need help with..."
              className={styles.input}
              style={{ minHeight: "80px", resize: "vertical" }}
            />

            <div className={styles.modalActionsTop}>
              <button onClick={handleServiceSubmit} className={styles.addBtn}>
                Add to Cart
              </button>
              <button onClick={() => setShowServiceModal(false)} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}