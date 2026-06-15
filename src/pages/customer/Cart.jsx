import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import styles from "../css/Cart.module.css";

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart, cartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const fetchPhone = async () => {
      if (!user) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().phone) {
          setPhone(userDoc.data().phone);
        }
      } catch (err) {
        console.error("Error fetching user phone:", err);
      }
    };
    fetchPhone();
  }, [user]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setError("");

    if (!phone.trim()) {
      setError("Please enter a phone number for delivery/contact.");
      return;
    }

    if (!/^\+?[0-9]{7,15}$/.test(phone.trim())) {
      setError("Please enter a valid phone number.");
      return;
    }

    setPlacing(true);

    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        customerName: user.displayName || "",
        customerEmail: user.email,
        customerPhone: phone.trim(),
        items: cart.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          qty: item.qty,
          category: item.category,
          notes: item.notes || "",
          preferredDate: item.preferredDate || null,
        })),
        total: cartTotal,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      clearCart();
      navigate("/dashboard");
    } catch (err) {
      console.error("Checkout error:", err);
      setError("Failed to place order: " + err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>Your Cart</h1>
        <p className={styles.mutedText}>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Your Cart</h1>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.list}>
        {cart.map((item) => (
          <div key={item.cartItemId} className={styles.itemCard}>
            <div className={styles.itemImageWrap}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className={styles.itemImage} />
              ) : (
                <div className={styles.placeholder}>No Image</div>
              )}
            </div>

            <div className={styles.itemInfo}>
              <div>
                <span className={styles.badge}>{item.category}</span>
                <h3 className={styles.itemName}>{item.name}</h3>
                <p className={styles.itemPrice}>Tsh {Number(item.price).toLocaleString()}</p>

                {item.category === "service" && (
                  <div className={styles.serviceDetails}>
                    {item.preferredDate && (
                      <p className={styles.detailLine}>
                        <strong>Preferred date:</strong> {item.preferredDate}
                      </p>
                    )}
                    {item.notes && (
                      <p className={styles.detailLine}>
                        <strong>Notes:</strong> {item.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.itemActions}>
                {item.category !== "service" && (
                  <div className={styles.qtyControl}>
                    <button
                      onClick={() => updateQty(item.cartItemId, item.qty - 1)}
                      className={styles.qtyBtn}
                    >
                      −
                    </button>
                    <span className={styles.qtyValue}>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.cartItemId, item.qty + 1)}
                      className={styles.qtyBtn}
                    >
                      +
                    </button>
                  </div>
                )}

                <p className={styles.lineTotal}>
                  Tsh {Number(item.price * item.qty).toLocaleString()}
                </p>

                <button onClick={() => removeFromCart(item.cartItemId)} className={styles.removeBtn}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.phoneSection}>
        <label className={styles.label}>Contact Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+255700000000"
          className={styles.input}
        />
        <p className={styles.helperText}>We'll use this number to contact you about your order.</p>
      </div>

      <div className={styles.summary}>
        <p className={styles.total}>Total: Tsh {Number(cartTotal).toLocaleString()}</p>
        <button onClick={handleCheckout} disabled={placing} className={styles.checkoutBtn}>
          {placing ? "Placing order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}