export default function ProductCard({ product }) {
  return (
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
        <p style={priceStyle}>${Number(product.price).toFixed(2)}</p>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#1a1a24",
  border: "1px solid #2a2a3a",
  borderRadius: "12px",
  overflow: "hidden",
  width: "260px",
  transition: "transform 0.2s, box-shadow 0.2s",
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
};