import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * ProtectedRoute
 * @param {string[]} allowedRoles — if empty/undefined, any authenticated user passes
 * @param {string}   redirectTo   — where to send unauthenticated users (default /login)
 */
const ProtectedRoute = ({ children, allowedRoles, redirectTo = "/login" }) => {
  const { user, role } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Student/teacher trying to access admin pages → send to their calendar
    const fallback = role === "student" || role === "teacher" ? "/calendar" : "/";
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
