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
      borderBottom: "1px solid #ddd",
    }}>
      <Link to="/" style={{ fontWeight: "bold", fontSize: "1.2rem", textDecoration: "none" }}>
        NetIrish
      </Link>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        <Link to="/">Home</Link>

        {!loading && !user && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {!loading && user && role === "customer" && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/cart">Cart</Link>
          </>
        )}

        {!loading && user && role === "admin" && (
          <>
            <Link to="/admin">Admin</Link>
            <Link to="/admin/products">Products</Link>
            <Link to="/admin/orders">Orders</Link>
          </>
        )}

        {!loading && user && (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  );
}