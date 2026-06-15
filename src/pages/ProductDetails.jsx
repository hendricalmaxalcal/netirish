import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import styles from "./css/ProductDetails.module.css";

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [notes, setNotes] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!product) return <div className={styles.notFound}>Product not found.</div>;

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
    addToCart(buildItem({ notes: notes.trim(), preferredDate: preferredDate || null }));
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
    localStorage.setItem("pendingCartItem", JSON.stringify(buildItem()));
    setShowAuthModal(false);
    navigate(path);
  };

  return (
    <>
      <div className={styles.page}>
        <Link to="/" className={styles.backBtn}>← Back to Home</Link>

        <div className={styles.container}>
          <div className={styles.imageWrap}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className={styles.image} />
            ) : (
              <div className={styles.placeholder}>No Image</div>
            )}
          </div>

          <div className={styles.info}>
            <span className={styles.badge}>{product.category}</span>
            <h1 className={styles.name}>{product.name}</h1>

            {product.subCategory && (
              <p className={styles.meta}>Category: {product.subCategory.replace("_", " ")}</p>
            )}
            {product.brand && (
              <p className={styles.meta}>Brand: {product.brand}</p>
            )}

            <p className={styles.description}>{product.description}</p>
            <p className={styles.price}>Tsh {Number(product.price).toLocaleString()}</p>

            <button onClick={handleAddClick} className={styles.addBtn}>
              {added ? "Added ✓" : isService ? "Request Service" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {/* Auth modal */}
      {showAuthModal && (
        <div className={styles.overlay} onClick={() => setShowAuthModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Login Required</h3>
            <p className={styles.modalText}>
              Please login or create an account to {isService ? "request this service" : "add items to your cart"}.
            </p>
            <div className={styles.modalActions}>
              <button onClick={() => goToAuth("/login")} className={styles.addBtn}>Login</button>
              <button onClick={() => goToAuth("/register")} className={styles.cancelBtn}>Register</button>
            </div>
          </div>
        </div>
      )}

      {/* Service modal */}
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
              className={styles.textarea}
            />

            <div className={styles.modalActions}>
              <button onClick={handleServiceSubmit} className={styles.addBtn}>Add to Cart</button>
              <button onClick={() => setShowServiceModal(false)} className={styles.cancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}