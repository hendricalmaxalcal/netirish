import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Admin Dashboard</h1>
      <p style={subtitleStyle}>Manage your store from here.</p>

      <div style={gridStyle}>
        <Link to="/admin/products" style={cardStyle}>
          <h3 style={cardTitleStyle}>Manage Products</h3>
          <p style={cardTextStyle}>Add, edit, or remove products and services</p>
        </Link>

        <Link to="/admin/orders" style={cardStyle}>
          <h3 style={cardTitleStyle}>Manage Orders</h3>
          <p style={cardTextStyle}>View and update customer orders</p>
        </Link>
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
  padding: "60px 30px",
};

const titleStyle = {
  fontSize: "2.5rem",
  fontWeight: "800",
  margin: "0 0 8px",
  background: "linear-gradient(90deg, #00c6ff, #7b2ff7)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textAlign: "center",
};

const subtitleStyle = {
  textAlign: "center",
  color: "#9a9aae",
  marginBottom: "40px",
};

const gridStyle = {
  display: "flex",
  gap: "24px",
  justifyContent: "center",
  flexWrap: "wrap",
};

const cardStyle = {
  display: "block",
  background: "#1a1a24",
  border: "1px solid #2a2a3a",
  borderRadius: "12px",
  padding: "30px",
  width: "260px",
  textDecoration: "none",
  color: "inherit",
  transition: "transform 0.2s, border-color 0.2s",
};

const cardTitleStyle = {
  margin: "0 0 10px",
  color: "#00c6ff",
  fontSize: "1.3rem",
};

const cardTextStyle = {
  color: "#9a9aae",
  fontSize: "0.9rem",
  margin: 0,
};