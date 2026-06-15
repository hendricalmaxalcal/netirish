import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { CartContext } from "../context/CartContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Restore pending cart item if any
      const pending = localStorage.getItem("pendingCartItem");
      if (pending) {
        try {
          addToCart(JSON.parse(pending));
        } catch (e) {
          console.error("Failed to restore pending cart item:", e);
        }
        localStorage.removeItem("pendingCartItem");
        navigate("/cart");
        return;
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Welcome Back</h1>
        <p style={subtitleStyle}>Login to your NetIrish account</p>

        {error && <p style={errorStyle}>{error}</p>}

        <form onSubmit={handleLogin}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            placeholder="you@example.com"
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
            placeholder="••••••••"
          />

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={footerTextStyle}>
          Don't have an account? <Link to="/register" style={linkStyle}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#0d0d0f",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Segoe UI', sans-serif",
  padding: "20px",
};

const cardStyle = {
  background: "#1a1a24",
  border: "1px solid #2a2a3a",
  borderRadius: "16px",
  padding: "40px",
  width: "100%",
  maxWidth: "400px",
  boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
};

const titleStyle = {
  fontSize: "2rem",
  fontWeight: "800",
  margin: "0 0 8px",
  textAlign: "center",
  background: "linear-gradient(90deg, #00c6ff, #7b2ff7)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

const subtitleStyle = {
  textAlign: "center",
  color: "#9a9aae",
  marginBottom: "30px",
  fontSize: "0.95rem",
};

const labelStyle = {
  display: "block",
  color: "#ccc",
  fontSize: "0.85rem",
  marginBottom: "6px",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  marginBottom: "18px",
  borderRadius: "8px",
  border: "1px solid #2a2a3a",
  background: "#0d0d0f",
  color: "#fff",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
};

const btnStyle = {
  width: "100%",
  padding: "13px",
  borderRadius: "30px",
  border: "none",
  background: "linear-gradient(90deg, #00c6ff, #7b2ff7)",
  color: "#fff",
  fontWeight: "700",
  fontSize: "1rem",
  cursor: "pointer",
  marginTop: "8px",
};

const errorStyle = {
  background: "#3a1a1a",
  color: "#ff6b6b",
  padding: "10px 14px",
  borderRadius: "8px",
  fontSize: "0.9rem",
  marginBottom: "20px",
  border: "1px solid #5a2a2a",
};

const footerTextStyle = {
  textAlign: "center",
  color: "#9a9aae",
  marginTop: "24px",
  fontSize: "0.9rem",
};

const linkStyle = {
  color: "#00c6ff",
  fontWeight: "600",
  textDecoration: "none",
};