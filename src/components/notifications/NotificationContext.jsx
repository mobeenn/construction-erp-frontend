import {
   createContext,
   useCallback,
   useContext,
   useEffect,
   useMemo,
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

   const refresh = useCallback(async ({ limit = 20 } = {}) => {
      if (!user) {
         setItems([]);
         setUnreadCount(0);
         return;
      }
      try {
         const [listRes, countRes] = await Promise.all([
            getMyNotifications({ limit }),
            getUnreadCount(),
         ]);
         setItems(listRes.data?.data || []);
         setUnreadCount(countRes.data?.data?.count || 0);
      } catch {
         /* silent — badge stays on last known values */
      }
   }, [user]);

   const fetchList = useCallback(async (params = {}) => {
      setLoading(true);
      try {
         const res = await getMyNotifications(params);
         return res.data?.data || [];
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
      if (shouldDecrement) setUnreadCount((c) => Math.max(0, c - 1));
      try {
         await markAsRead(id);
         const countRes = await getUnreadCount();
         setUnreadCount(countRes.data?.data?.count || 0);
      } catch (err) {
         await refresh();
         throw err;
      }
   }, [refresh]);

   const markAllRead = useCallback(async () => {
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
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
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
      try {
         await deleteNotification(id);
         const countRes = await getUnreadCount();
         setUnreadCount(countRes.data?.data?.count || 0);
      } catch (err) {
         await refresh();
         throw err;
      }
   }, [refresh]);

   useEffect(() => {
      if (!user) {
         setItems([]);
         setUnreadCount(0);
         return undefined;
      }
      refresh();
      const tick = () => {
         if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
         refresh();
      };
      const interval = setInterval(tick, 30000);
      const onVisible = () => {
         if (document.visibilityState === "visible") refresh();
      };
      document.addEventListener("visibilitychange", onVisible);
      return () => {
         clearInterval(interval);
         document.removeEventListener("visibilitychange", onVisible);
      };
   }, [user, refresh]);

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
