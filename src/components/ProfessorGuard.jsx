import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProfessorGuard({ children, requireVerification = false }) {
  const { user, loading, authError, restore } = useAuth();
  const location = useLocation();
  if (loading) return <p role="status" className="content-width">Checking your session...</p>;
  if (authError) return <div className="content-width"><p role="alert">{authError}</p><button onClick={restore} type="button">Try again</button></div>;
  if (!user) return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  if (user.role !== "PROFESSOR") return <Navigate replace to="/opportunities" />;
  if (requireVerification && !user.professorVerified) {
    return <Navigate replace state={{ message: "Professor verification is required to manage opportunities." }} to="/professor/dashboard" />;
  }
  return children;
}
