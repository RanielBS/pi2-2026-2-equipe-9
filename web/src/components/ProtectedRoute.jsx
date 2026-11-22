
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/authStore";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, token } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const perfil = user.is_admin ? "admin" : user.role;

  if (allowedRoles && !allowedRoles.includes(perfil)) {
    if (perfil === "admin") {
      return <Navigate to="/admin" replace />;
    }

    if (perfil === "tecnico") {
      return <Navigate to="/fila-tecnico" replace />;
    }

    return <Navigate to="/home" replace />;
  }

  return children;
}
