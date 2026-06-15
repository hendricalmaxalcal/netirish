import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div style={{ padding: "30px" }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin. Manage your store from here.</p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <Link to="/admin/products" style={cardStyle}>
          <h3>Manage Products</h3>
          <p>Add, edit, or remove products and services</p>
        </Link>

        <Link to="/admin/orders" style={cardStyle}>
          <h3>Manage Orders</h3>
          <p>View and update customer orders</p>
        </Link>
      </div>
    </div>
  );
}

const cardStyle = {
  display: "block",
  padding: "20px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  textDecoration: "none",
  color: "inherit",
  width: "200px",
};