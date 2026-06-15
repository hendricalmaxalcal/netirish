import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

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

      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Create Account</h1>
        <p style={subtitleStyle}>Join NetIrish today</p>

        {error && <p style={errorStyle}>{error}</p>}

        <form onSubmit={handleRegister}>
          <div style={rowStyle}>
            <div style={colStyle}>
              <label style={labelStyle}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
            <div style={colStyle}>
              <label style={labelStyle}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          </div>

          <div style={rowStyle}>
            <div style={colStyle}>
              <label style={labelStyle}>Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="1"
                style={inputStyle}
              />
            </div>
            <div style={colStyle}>
              <label style={labelStyle}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <label style={labelStyle}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
            placeholder="you@example.com"
          />

          <label style={labelStyle}>Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="+255700000000"
            style={inputStyle}
          />

          <label style={labelStyle}>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            style={inputStyle}
            placeholder="••••••••"
          />

          <label style={labelStyle}>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={6}
            style={inputStyle}
            placeholder="••••••••"
          />

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p style={footerTextStyle}>
          Already have an account? <Link to="/login" style={linkStyle}>Login</Link>
        </p>
      </div>
    </div>
  );
}

/* ---------- Styles ---------- */

const pageStyle = {
  minHeight: "calc(100vh - 70px)",
  backgroundColor: "#0d0d0f",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "'Segoe UI', sans-serif",
  padding: "40px 20px",
};

const cardStyle = {
  background: "#1a1a24",
  border: "1px solid #2a2a3a",
  borderRadius: "16px",
  padding: "40px",
  width: "100%",
  maxWidth: "480px",
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

const rowStyle = {
  display: "flex",
  gap: "12px",
};

const colStyle = {
  flex: 1,
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