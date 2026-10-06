import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ToastProvider } from "./components/ui/ToastContext";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
   <BrowserRouter>
      <ToastProvider>
         <AuthProvider>
            <App />
         </AuthProvider>
      </ToastProvider>
   </BrowserRouter>,
);
