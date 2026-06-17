import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { sendEmailVerification, reload, signOut } from "firebase/auth";
import styles from "./css/VerifyEmail.module.css";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.emailVerified) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);
    try {
      await sendEmailVerification(user);
      setSuccess("Verification email resent! Check your inbox and spam folder.");
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setError("");
    setSuccess("");
    setChecking(true);
    try {
      await reload(user);
      if (auth.currentUser.emailVerified) {
        navigate("/dashboard");
      } else {
        setError("Email not verified yet. Please check your inbox and click the verification link.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>📧</div>
        <h1 className={styles.title}>Verify Your Email</h1>
        <p className={styles.subtitle}>
          We sent a verification link to{" "}
          <span className={styles.email}>{user?.email}</span>.
          Please check your inbox and click the link to activate your account.
        </p>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.successMsg}>{success}</p>}

        <hr className={styles.divider} />

        <button
          onClick={handleCheckVerification}
          disabled={checking}
          className={styles.btn}
        >
          {checking ? "Checking..." : "I've verified my email"}
        </button>

        <button
          onClick={handleResend}
          disabled={resending}
          className={styles.outlineBtn}
        >
          {resending ? "Sending..." : "Resend verification email"}
        </button>

        <p className={styles.footerText}>
          Wrong email?{" "}
          <button onClick={handleLogout} className={styles.link}>
            Logout and register again
          </button>
        </p>
      </div>
    </div>
  );
}
