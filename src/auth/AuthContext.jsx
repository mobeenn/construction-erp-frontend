import { createContext, useContext, useEffect, useState } from "react";
import { meApi, loginApi } from "../api/auth.api";
import { can } from "./permissions";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);

   const login = async (email, password) => {
      const res = await loginApi({ email, password });

      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);

      return res.data.user;
   };

   const logout = () => {
      localStorage.removeItem("token");
      setUser(null);
   };

   const loadUser = async () => {
      try {
         const res = await meApi();
         setUser(res.data.user);
      } catch {
         setUser(null);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      loadUser();
   }, []);

   return (
      <AuthContext.Provider value={{ user, login, logout, loading, can: (resource, action) => can(user, resource, action) }}>
         {children}
      </AuthContext.Provider>
   );
};

export const useAuth = () => useContext(AuthContext);
