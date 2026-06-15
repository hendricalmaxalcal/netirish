import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { auth } from "../../firebase/config";
import { signOut } from "firebase/auth";

export default function Navbar() {
  const { user, role, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 30px",
      borderBottom: "1px solid #2a2a3a",
      background: "#0d0d0f",
    }}>
      <Link to="/" style={{ fontWeight: "bold", fontSize: "1.2rem", textDecoration: "none", color: "#fff" }}>
        NetIrish
      </Link>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#ccc" }}>Home</Link>

        {!loading && !user && (
          <>
            <Link to="/login" style={{ textDecoration: "none", color: "#ccc" }}>Login</Link>
            <Link to="/register" style={{ textDecoration: "none", color: "#ccc" }}>Register</Link>
          </>
        )}

        {!loading && user && role === "customer" && (
          <>
            <Link to="/dashboard" style={{ textDecoration: "none", color: "#ccc" }}>Dashboard</Link>
            <Link to="/cart" style={{ textDecoration: "none", color: "#ccc" }}>Cart</Link>
          </>
        )}

        {!loading && user && role === "admin" && (
          <>
            <Link to="/admin" style={{ textDecoration: "none", color: "#ccc" }}>Admin</Link>
            <Link to="/admin/products" style={{ textDecoration: "none", color: "#ccc" }}>Products</Link>
            <Link to="/admin/orders" style={{ textDecoration: "none", color: "#ccc" }}>Orders</Link>
          </>
        )}

        {!loading && user && (
          <button
            onClick={handleLogout}
            style={{
              textDecoration: "none",
              color: "#ccc",
              background: "transparent",
              border: "1px solid #2a2a3a",
              borderRadius: "20px",
              padding: "6px 16px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}