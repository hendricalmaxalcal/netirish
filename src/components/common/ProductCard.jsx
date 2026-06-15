import { useContext, useState } from "react";
import { CartContext } from "../../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [added, setAdded] = useState(false);

  const isService = product.category === "service";

  const handleAddClick = () => {
    if (isService) {
      setShowServiceModal(true);
    } else {
      addToCart({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        qty: 1,
        category: product.category,
        imageUrl: product.imageUrl || "",
      });
      flashAdded();
    }
  };

  const handleServiceSubmit = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      qty: 1,
      category: "service",
      imageUrl: product.imageUrl || "",
      notes: notes.trim(),
      preferredDate: preferredDate || null,
    });
    setShowServiceModal(false);
    setNotes("");
    setPreferredDate("");
    flashAdded();
  };

  const flashAdded = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
      <div style={cardStyle}>
        <div style={imageWrapperStyle}>
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} style={imageStyle} />
          ) : (
            <div style={placeholderStyle}>No Image</div>
          )}
        </div>
        <div style={{ padding: "16px" }}>
          <span style={badgeStyle}>{product.category}</span>
          <h3 style={{ margin: "10px 0 6px", color: "#fff" }}>{product.name}</h3>
          <p style={descStyle}>{product.description}</p>
          <p style={priceStyle}>Tsh {Number(product.price).toLocaleString()}</p>

          <button onClick={handleAddClick} style={addBtnStyle}>
            {added ? "Added ✓" : isService ? "Request Service" : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* Service request modal */}
      {showServiceModal && (
        <div style={overlayStyle} onClick={() => setShowServiceModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: "#fff" }}>Request: {product.name}</h3>

            <label style={labelStyle}>Preferred Date (optional)</label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              style={inputStyle}
            />

            <label style={labelStyle}>Details / Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what you need help with..."
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button onClick={handleServiceSubmit} style={addBtnStyle}>
                Add to Cart
              </button>
              <button onClick={() => setShowServiceModal(false)} style={cancelBtnStyle}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Styles ---------- */

const cardStyle = {
  background: "#1a1a24",
  border: "1px solid #2a2a3a",
  borderRadius: "12px",
  overflow: "hidden",
  width: "260px",
};

const imageWrapperStyle = {
  width: "100%",
  height: "180px",
  backgroundColor: "#25253a",
};

const imageStyle = {
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
};

const badgeStyle = {
  fontSize: "0.75rem",
  background: "#2a2a3a",
  color: "#00c6ff",
  padding: "3px 10px",
  borderRadius: "12px",
  textTransform: "capitalize",
};

const descStyle = {
  color: "#9a9aae",
  fontSize: "0.9rem",
  minHeight: "40px",
};

const priceStyle = {
  fontWeight: "bold",
  fontSize: "1.15rem",
  color: "#7b2ff7",
  marginTop: "8px",
  marginBottom: "12px",
};

const addBtnStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "20px",
  border: "none",
  background: "linear-gradient(90deg, #00c6ff, #7b2ff7)",
  color: "#fff",
  fontWeight: "700",
  fontSize: "0.9rem",
  cursor: "pointer",
};

const cancelBtnStyle = {
  flex: 1,
  padding: "10px",
  borderRadius: "20px",
  border: "1px solid #2a2a3a",
  background: "transparent",
  color: "#ccc",
  fontWeight: "600",
  cursor: "pointer",
};

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#1a1a24",
  border: "1px solid #2a2a3a",
  borderRadius: "12px",
  padding: "24px",
  width: "100%",
  maxWidth: "400px",
};

const labelStyle = {
  display: "block",
  color: "#ccc",
  fontSize: "0.85rem",
  marginBottom: "6px",
  marginTop: "12px",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #2a2a3a",
  background: "#0d0d0f",
  color: "#fff",
  fontSize: "0.9rem",
  outline: "none",
  boxSizing: "border-box",
};