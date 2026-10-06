// import { useAuth } from "./AuthContext";
// import { Navigate } from "react-router-dom";

// export default function ProtectedRoute({ children }) {
//    const { user, loading } = useAuth();

//    if (loading) return <p>Loading...</p>;

//    if (!user) return <Navigate to="/login" />;

//    return children;
// }
import { useAuth } from "./AuthContext";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role, permission }) {
   const { user, loading, can } = useAuth();

   if (loading) return <p>Loading...</p>;

   if (!user) return <Navigate to="/login" />;

   // role-based redirect
   if (role && user.role !== role) {
      return <Navigate to="/" />;
   }
   if (permission && !can(user, permission.resource, permission.action)) {
      return <Navigate to="/forbidden" replace />;
   }

   return children;
}
