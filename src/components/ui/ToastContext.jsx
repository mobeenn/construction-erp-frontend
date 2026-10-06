import {
   createContext,
   useCallback,
   useContext,
   useMemo,
   useRef,
   useState,
} from "react";
import ToastViewport from "./Toast";

const ToastContext = createContext(null);

let counter = 0;

const TYPES = ["success", "error", "warning", "info"];

export function ToastProvider({ children }) {
   const [toasts, setToasts] = useState([]);
   const timers = useRef(new Map());

   const dismiss = useCallback((id) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      const timer = timers.current.get(id);
      if (timer) {
         clearTimeout(timer);
         timers.current.delete(id);
      }
   }, []);

   const push = useCallback(
      (type, message, options = {}) => {
         const id = ++counter;
         const toast = {
            id,
            type: TYPES.includes(type) ? type : "info",
            message,
            title: options.title,
            duration: options.duration ?? 4200,
         };

         setToasts((prev) => [...prev, toast]);

         if (toast.duration > 0) {
            const timer = setTimeout(() => dismiss(id), toast.duration);
            timers.current.set(id, timer);
         }

         return id;
      },
      [dismiss],
   );

   const api = useMemo(
      () => ({
         toast: push,
         success: (message, options) => push("success", message, options),
         error: (message, options) => push("error", message, options),
         warning: (message, options) => push("warning", message, options),
         info: (message, options) => push("info", message, options),
         dismiss,
      }),
      [push, dismiss],
   );

   return (
      <ToastContext.Provider value={api}>
         {children}
         <ToastViewport toasts={toasts} onDismiss={dismiss} />
      </ToastContext.Provider>
   );
}

export function useToast() {
   const ctx = useContext(ToastContext);
   if (!ctx) {
      throw new Error("useToast must be used within a ToastProvider");
   }
   return ctx;
}
