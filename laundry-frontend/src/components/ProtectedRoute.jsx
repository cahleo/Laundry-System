import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: 40, fontFamily: "Inter, sans-serif", color: "#5A7185" }}>Loading…</div>;
  }
  if (!admin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
