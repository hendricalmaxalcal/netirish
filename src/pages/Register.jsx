
import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { CartContext } from "../context/CartContext";
import styles from "./css/Register.module.css";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (Number(formData.age) < 13) {
      setError("You must be at least 13 years old to register");
      return;
    }
    if (!/^\+?[0-9]{7,15}$/.test(formData.phone)) {
      setError("Please enter a valid phone number");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: `${formData.firstName} ${formData.lastName}`,
      });

      await setDoc(doc(db, "users", user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        age: Number(formData.age),
        gender: formData.gender,
        email: formData.email,
        phone: formData.phone,
        role: "customer",
        createdAt: new Date(),
      });

      // Send verification email
      await sendEmailVerification(user);
      console.log("✅ Verification email sent to:", user.email);

      // Restore pending cart item if any
      const pending = localStorage.getItem("pendingCartItem");
      if (pending) {
        try {
          addToCart(JSON.parse(pending));
        } catch (e) {
          console.error("Failed to restore pending cart item:", e);
        }
        localStorage.removeItem("pendingCartItem");
        navigate("/verify-email");
        return;
      }

      navigate("/verify-email");
    } catch (err) {
      console.error("Register error:", err.code, err.message);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Try logging in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Join NetIrish today</p>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleRegister}>
          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.col}>
              <label className={styles.label}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.col}>
              <label className={styles.label}>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="1"
                className={styles.input}
              />
            </div>
            <div className={styles.col}>
              <label className={styles.label}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className={styles.input}
                style={{ cursor: "pointer" }}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <label className={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.input}
            placeholder="you@example.com"
          />

          <label className={styles.label}>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="+255700000000"
            className={styles.input}
          />

          <label className={styles.label}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className={styles.input}
            placeholder="••••••••"
          />

          <label className={styles.label}>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            className={styles.input}
            placeholder="••••••••"
          />

          <button
            type="submit"
            disabled={loading}
            className={styles.btn}
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" className={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}