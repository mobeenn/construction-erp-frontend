import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
   FiBell,
   FiCheckCircle,
   FiAlertTriangle,
   FiInfo,
   FiX,
   FiTrash2,
} from "react-icons/fi";
import {
   getMyNotifications,
   getUnreadCount,
   markAsRead,
   markAllAsRead,
   deleteNotification,
} from "../../services/notificationService";
import { useToast } from "../ui/ToastContext";

const TYPE_META = {
   info: { icon: FiInfo, color: "#2A7B9B", bg: "rgba(42,123,155,0.1)" },
   success: { icon: FiCheckCircle, color: "#22A06B", bg: "rgba(34,160,107,0.1)" },
   warning: { icon: FiAlertTriangle, color: "#D9A441", bg: "rgba(217,164,65,0.14)" },
   error: { icon: FiX, color: "#E05252", bg: "rgba(224,82,82,0.1)" },
};

export default function NotificationCenter() {
   const navigate = useNavigate();
   const toast = useToast();
   const [notifications, setNotifications] = useState([]);
   const [unreadCount, setUnreadCount] = useState(0);
   const [isOpen, setIsOpen] = useState(false);

   const loadNotifications = useCallback(async () => {
      try {
         const res = await getMyNotifications({ limit: 20 });
         setNotifications(res.data.data || []);
      } catch {
         /* silent */
      }
   }, []);

   const loadUnreadCount = useCallback(async () => {
      try {
         const res = await getUnreadCount();
         setUnreadCount(res.data.data.count || 0);
      } catch {
         /* silent */
      }
   }, []);

   const refresh = useCallback(() => {
      loadNotifications();
      loadUnreadCount();
   }, [loadNotifications, loadUnreadCount]);

   useEffect(() => {
      refresh();
      const interval = setInterval(refresh, 30000);
      return () => clearInterval(interval);
   }, [refresh]);

   const handleMarkAsRead = async (id) => {
      try {
         await markAsRead(id);
         refresh();
      } catch {
         toast.error("Could not update notification.");
      }
   };

   const handleMarkAllAsRead = async () => {
      try {
         await markAllAsRead();
         toast.success("All caught up.");
         refresh();
      } catch {
         toast.error("Could not update notifications.");
      }
   };

   const handleDelete = async (id) => {
      try {
         await deleteNotification(id);
         refresh();
      } catch {
         toast.error("Could not delete notification.");
      }
   };

   const formatDate = (date) => {
      const d = new Date(date);
      const diff = Date.now() - d;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      if (days < 7) return `${days}d ago`;
      return d.toLocaleDateString();
   };

   return (
      <div className="relative">
         <button
            type="button"
            onClick={() => setIsOpen((o) => !o)}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-ink-500 transition hover:border-brand-300 hover:text-ink-900"
            aria-label="Notifications"
         >
            <FiBell size={17} />
            {unreadCount > 0 && (
               <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#E05252] px-1 text-[0.62rem] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
               </span>
            )}
         </button>

         {isOpen && (
            <>
               <button
                  type="button"
                  aria-label="Close notifications"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setIsOpen(false)}
               />
               <div className="animate-scale-in absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_70px_-30px_rgba(16,42,54,0.55)]">
                  <div className="flex items-center justify-between border-b border-line px-4 py-3">
                     <h3 className="text-sm font-bold text-ink-900">Notifications</h3>
                     {unreadCount > 0 && (
                        <button
                           type="button"
                           onClick={handleMarkAllAsRead}
                           className="text-xs font-semibold text-brand-500 hover:underline"
                        >
                           Mark all read
                        </button>
                     )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                     {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                           <span className="grid h-12 w-12 place-items-center rounded-2xl bg-canvas text-ink-400">
                              <FiBell size={20} />
                           </span>
                           <p className="text-sm text-ink-500">No notifications</p>
                        </div>
                     ) : (
                        notifications.map((n) => {
                           const meta = TYPE_META[n.type] || TYPE_META.info;
                           const Icon = meta.icon;
                           return (
                              <div
                                 key={n._id}
                                 className={`group flex gap-3 border-b border-line px-4 py-3 transition last:border-b-0 hover:bg-canvas ${
                                    !n.isRead ? "bg-brand-50/40" : ""
                                 }`}
                              >
                                 <span
                                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
                                    style={{ background: meta.bg, color: meta.color }}
                                 >
                                    <Icon size={15} />
                                 </span>
                                 <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                       <p className="truncate text-[0.8rem] font-semibold text-ink-900">
                                          {n.title}
                                       </p>
                                       {!n.isRead && (
                                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                                       )}
                                    </div>
                                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">
                                       {n.message}
                                    </p>
                                    <p className="mt-1 text-[0.68rem] text-ink-400">
                                       {formatDate(n.createdAt)}
                                    </p>
                                 </div>
                                 <div className="flex shrink-0 flex-col gap-1 opacity-0 transition group-hover:opacity-100">
                                    {!n.isRead && (
                                       <button
                                          type="button"
                                          onClick={() => handleMarkAsRead(n._id)}
                                          className="text-[0.68rem] font-semibold text-brand-500 hover:underline"
                                       >
                                          Read
                                       </button>
                                    )}
                                    <button
                                       type="button"
                                       onClick={() => handleDelete(n._id)}
                                       className="grid h-6 w-6 place-items-center rounded-md text-ink-400 hover:bg-[rgba(224,82,82,0.1)] hover:text-[#c23b3b]"
                                       aria-label="Delete notification"
                                    >
                                       <FiTrash2 size={13} />
                                    </button>
                                 </div>
                              </div>
                           );
                        })
                     )}
                  </div>

                  <button
                     type="button"
                     onClick={() => {
                        setIsOpen(false);
                        navigate("/notifications");
                     }}
                     className="w-full border-t border-line px-4 py-3 text-center text-xs font-semibold text-brand-500 transition hover:bg-canvas"
                  >
                     View all notifications
                  </button>
               </div>
            </>
         )}
      </div>
   );
}
