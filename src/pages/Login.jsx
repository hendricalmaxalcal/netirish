import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase/config";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { CartContext } from "../context/CartContext";
import styles from "./css/Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

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

  const handleForgotPassword = async () => {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address above first, then click Forgot password.");
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccess(`Password reset email sent to ${email}. Check your inbox (and spam folder).`);
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError(err.message);
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Login to your NetIrish account</p>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.successMsg}>{success}</p>}

        <form onSubmit={handleLogin}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            placeholder="you@example.com"
          />

          <label className={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={handleForgotPassword}
            className={styles.forgotLink}
            disabled={resetLoading}
          >
            {resetLoading ? "Sending..." : "Forgot password?"}
          </button>

          <button type="submit" disabled={loading} className={styles.btn}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className={styles.footerText}>
          Don't have an account?{" "}
          <Link to="/register" className={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
}