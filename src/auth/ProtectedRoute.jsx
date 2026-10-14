import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";
import { AuthShellSkeleton } from "../components/ui/States";
import { roleHome } from "./roleHomes";

export default function ProtectedRoute({ children, role, roles, permission }) {
   const { user, loading, can } = useAuth();

   if (loading) return <AuthShellSkeleton />;

   if (!user) return <Navigate to="/login" replace />;

   const allowedRoles = roles?.length ? roles : role ? [role] : null;

   if (allowedRoles && !allowedRoles.includes(user.role)) {
      return <Navigate to={roleHome(user.role)} replace />;
   }

   if (permission && !can(permission.resource, permission.action)) {
      return <Navigate to="/forbidden" replace />;
   }

   return children;
}
