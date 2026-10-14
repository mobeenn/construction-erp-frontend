import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
   useRef,
   useState,
} from "react";
import {
   getMyNotifications,
   getUnreadCount,
   markAsRead,
   markAllAsRead,
   deleteNotification,
} from "../../services/notificationService";
import { useAuth } from "../../auth/AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
   const { user } = useAuth();
   const [items, setItems] = useState([]);
   const [unreadCount, setUnreadCount] = useState(0);
   const [loading, setLoading] = useState(false);
   const unreadRef = useRef(0);

   const refreshCount = useCallback(async () => {
      if (!user) {
         unreadRef.current = 0;
         setUnreadCount(0);
         return;
      }
      try {
         const countRes = await getUnreadCount();
         const next = countRes.data?.data?.count || 0;
         if (next !== unreadRef.current) {
            unreadRef.current = next;
            setUnreadCount(next);
         }
      } catch {
         /* silent — badge stays on last known values */
      }
   }, [user]);

   const refresh = useCallback(async ({ limit = 20 } = {}) => {
      if (!user) {
         setItems([]);
         unreadRef.current = 0;
         setUnreadCount(0);
         return;
      }
      try {
         const [listRes, countRes] = await Promise.all([
            getMyNotifications({ limit }),
            getUnreadCount(),
         ]);
         setItems(listRes.data?.data || []);
         const next = countRes.data?.data?.count || 0;
         unreadRef.current = next;
         setUnreadCount(next);
      } catch {
         /* silent — badge stays on last known values */
      }
   }, [user]);

   const fetchList = useCallback(async (params = {}) => {
      setLoading(true);
      try {
         const res = await getMyNotifications(params);
         const list = res.data?.data || [];
         setItems(list);
         return list;
      } finally {
         setLoading(false);
      }
   }, []);

   const markRead = useCallback(async (id) => {
      let shouldDecrement = false;
      setItems((prev) =>
         prev.map((n) => {
            if (n._id !== id) return n;
            if (!n.isRead) shouldDecrement = true;
            return { ...n, isRead: true };
         }),
      );
      if (shouldDecrement) {
         setUnreadCount((c) => {
            const next = Math.max(0, c - 1);
            unreadRef.current = next;
            return next;
         });
      }
      try {
         await markAsRead(id);
      } catch (err) {
         await refresh();
         throw err;
      }
   }, [refresh]);

   const markAllRead = useCallback(async () => {
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      unreadRef.current = 0;
      setUnreadCount(0);
      try {
         await markAllAsRead();
      } catch (err) {
         await refresh();
         throw err;
      }
   }, [refresh]);

   const remove = useCallback(async (id) => {
      let wasUnread = false;
      setItems((prev) => {
         const target = prev.find((n) => n._id === id);
         wasUnread = target && !target.isRead;
         return prev.filter((n) => n._id !== id);
      });
      if (wasUnread) {
         setUnreadCount((c) => {
            const next = Math.max(0, c - 1);
            unreadRef.current = next;
            return next;
         });
      }
      try {
         await deleteNotification(id);
      } catch (err) {
         await refresh();
         throw err;
      }
   }, [refresh]);

   useEffect(() => {
      if (!user) {
         setItems([]);
         unreadRef.current = 0;
         setUnreadCount(0);
         return undefined;
      }
      // Initial: count only; list loads when panel/page opens via fetchList/refresh
      refreshCount();
      const tick = () => {
         if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
         refreshCount();
      };
      const interval = setInterval(tick, 30000);
      const onVisible = () => {
         if (document.visibilityState === "visible") refreshCount();
      };
      document.addEventListener("visibilitychange", onVisible);
      return () => {
         clearInterval(interval);
         document.removeEventListener("visibilitychange", onVisible);
      };
   }, [user, refreshCount]);

   const value = useMemo(
      () => ({
         items,
         unreadCount,
         loading,
         refresh,
         fetchList,
         markRead,
         markAllRead,
         remove,
      }),
      [items, unreadCount, loading, refresh, fetchList, markRead, markAllRead, remove],
   );

   return (
      <NotificationContext.Provider value={value}>
         {children}
      </NotificationContext.Provider>
   );
}

export function useNotifications() {
   const ctx = useContext(NotificationContext);
   if (!ctx) {
      throw new Error("useNotifications must be used within NotificationProvider");
   }
   return ctx;
}
