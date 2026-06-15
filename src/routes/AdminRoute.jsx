import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export const AdminRoute = ({ children }) => {
  const { user, role, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;
  return role === "admin" ? children : <Navigate to="/dashboard" />;
};