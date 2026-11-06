import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfessorGuard({ children, requireVerification = false }) {
  const { user, authError } = useAuth();
  const location = useLocation();
  if (authError) return <p role="alert" className="content-width">{authError}</p>;
  if (!user) return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  if (user.role !== "Professor") return <Navigate replace to="/opportunities" />;
  if (requireVerification && !user.verified) {
    return <Navigate replace state={{ message: "Professor verification is required to manage opportunities." }} to="/professor/dashboard" />;
  }
  return children;
}
