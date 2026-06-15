import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart, cartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  // Pre-fill phone from user's profile
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
      <div style={pageStyle}>
        <h1 style={titleStyle}>Your Cart</h1>
        <p style={mutedTextStyle}>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Your Cart</h1>

      {error && <p style={errorStyle}>{error}</p>}

      <div style={listStyle}>
        {cart.map((item) => (
          <div key={item.cartItemId} style={itemCardStyle}>
            <div style={itemImageWrapStyle}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} style={itemImageStyle} />
              ) : (
                <div style={placeholderStyle}>No Image</div>
              )}
            </div>

            <div style={itemInfoStyle}>
              <div>
                <span style={badgeStyle}>{item.category}</span>
                <h3 style={itemNameStyle}>{item.name}</h3>
                <p style={itemPriceStyle}>Tsh {Number(item.price).toLocaleString()}</p>

                {item.category === "service" && (
                  <div style={serviceDetailsStyle}>
                    {item.preferredDate && (
                      <p style={detailLineStyle}>
                        <strong>Preferred date:</strong> {item.preferredDate}
                      </p>
                    )}
                    {item.notes && (
                      <p style={detailLineStyle}>
                        <strong>Notes:</strong> {item.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div style={itemActionsStyle}>
                {item.category !== "service" && (
                  <div style={qtyControlStyle}>
                    <button
                      onClick={() => updateQty(item.cartItemId, item.qty - 1)}
                      style={qtyBtnStyle}
                    >
                      −
                    </button>
                    <span style={qtyValueStyle}>{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.cartItemId, item.qty + 1)}
                      style={qtyBtnStyle}
                    >
                      +
                    </button>
                  </div>
                )}

                <p style={lineTotalStyle}>
                  Tsh {Number(item.price * item.qty).toLocaleString()}
                </p>

                <button onClick={() => removeFromCart(item.cartItemId)} style={removeBtnStyle}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={phoneSectionStyle}>
        <label style={labelStyle}>Contact Phone Number</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+255700000000"
          style={inputStyle}
        />
        <p style={helperTextStyle}>We'll use this number to contact you about your order.</p>
      </div>

      <div style={summaryStyle}>
        <p style={totalStyle}>Total: Tsh {Number(cartTotal).toLocaleString()}</p>
        <button onClick={handleCheckout} disabled={placing} style={checkoutBtnStyle}>
          {placing ? "Placing order..." : "Place Order"}
        </button>
      </div>
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

const mutedTextStyle = {
  color: "#888",
};

const errorStyle = {
  background: "#3a1a1a",
  color: "#ff6b6b",
  padding: "10px 14px",
  borderRadius: "8px",
  fontSize: "0.9rem",
  marginBottom: "16px",
  border: "1px solid #5a2a2a",
  maxWidth: "700px",
};

const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  maxWidth: "700px",
  marginBottom: "30px",
};

const itemCardStyle = {
  display: "flex",
  gap: "16px",
  background: "#1a1a24",
  border: "1px solid #2a2a3a",
  borderRadius: "12px",
  padding: "16px",
};

const itemImageWrapStyle = {
  width: "90px",
  height: "90px",
  flexShrink: 0,
  borderRadius: "8px",
  overflow: "hidden",
  background: "#25253a",
};

const itemImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const placeholderStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#555",
  fontSize: "0.75rem",
};

const itemInfoStyle = {
  flex: 1,
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  gap: "10px",
};

const badgeStyle = {
  fontSize: "0.7rem",
  background: "#2a2a3a",
  color: "#00c6ff",
  padding: "2px 8px",
  borderRadius: "10px",
  textTransform: "capitalize",
};

const itemNameStyle = {
  margin: "6px 0 4px",
  fontSize: "1rem",
  color: "#fff",
};

const itemPriceStyle = {
  margin: 0,
  color: "#9a9aae",
  fontSize: "0.9rem",
};

const serviceDetailsStyle = {
  marginTop: "8px",
};

const detailLineStyle = {
  margin: "2px 0",
  fontSize: "0.8rem",
  color: "#9a9aae",
};

const itemActionsStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "8px",
};

const qtyControlStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "#0d0d0f",
  border: "1px solid #2a2a3a",
  borderRadius: "20px",
  padding: "4px 10px",
};

const qtyBtnStyle = {
  background: "transparent",
  border: "none",
  color: "#00c6ff",
  fontSize: "1.1rem",
  cursor: "pointer",
  width: "20px",
};

const qtyValueStyle = {
  minWidth: "20px",
  textAlign: "center",
};

const lineTotalStyle = {
  margin: 0,
  fontWeight: "700",
  color: "#7b2ff7",
};

const removeBtnStyle = {
  background: "transparent",
  border: "1px solid #2a2a3a",
  color: "#ff6b6b",
  borderRadius: "6px",
  padding: "4px 12px",
  fontSize: "0.8rem",
  cursor: "pointer",
};

const phoneSectionStyle = {
  maxWidth: "700px",
  marginBottom: "24px",
  paddingTop: "20px",
  borderTop: "1px solid #2a2a3a",
};

const labelStyle = {
  display: "block",
  color: "#ccc",
  fontSize: "0.9rem",
  marginBottom: "8px",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid #2a2a3a",
  background: "#1a1a24",
  color: "#fff",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
  maxWidth: "300px",
};

const helperTextStyle = {
  marginTop: "6px",
  color: "#9a9aae",
  fontSize: "0.8rem",
};

const summaryStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: "700px",
  paddingTop: "20px",
  borderTop: "1px solid #2a2a3a",
  flexWrap: "wrap",
  gap: "16px",
};

const totalStyle = {
  fontSize: "1.4rem",
  fontWeight: "800",
  margin: 0,
  color: "#00c6ff",
};

const checkoutBtnStyle = {
  padding: "14px 36px",
  borderRadius: "30px",
  border: "none",
  background: "linear-gradient(90deg, #00c6ff, #7b2ff7)",
  color: "#fff",
  fontWeight: "700",
  fontSize: "1rem",
  cursor: "pointer",
};