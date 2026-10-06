import { useEffect, useState, useCallback } from "react";
import { FiBell, FiCheck, FiCheckCircle, FiInfo, FiTrash2, FiX, FiAlertTriangle } from "react-icons/fi";
import {
   getMyNotifications,
   markAsRead,
   markAllAsRead,
   deleteNotification,
} from "../../services/notificationService";
import { useToast } from "../../components/ui/ToastContext";
import Button from "../../components/ui/Button";
import { FilterSelect } from "../../components/ui/Controls";
import { EmptyState, TableSkeleton } from "../../components/ui/States";

const TYPE_META = {
   info: { icon: FiInfo, tone: "brand" },
   success: { icon: FiCheckCircle, tone: "success" },
   warning: { icon: FiAlertTriangle, tone: "warning" },
   error: { icon: FiX, tone: "danger" },
};

const TONE_STYLES = {
   brand: "bg-brand-50 text-brand-500",
   success: "bg-mint-50 text-mint-600",
   warning: "bg-[rgba(217,164,65,0.13)] text-[#9a721f]",
   danger: "bg-[rgba(224,82,82,0.1)] text-[#c23b3b]",
};

export default function NotificationsPage() {
   const toast = useToast();
   const [notifications, setNotifications] = useState([]);
   const [loading, setLoading] = useState(true);
   const [filter, setFilter] = useState("all");

   const loadNotifications = useCallback(async (showLoader = true) => {
      if (showLoader) setLoading(true);
      try {
         const params = {};
         if (filter === "unread") params.unreadOnly = true;
         const res = await getMyNotifications(params);
         setNotifications(res.data.data || []);
      } catch (error) {
         toast.error(error.response?.data?.message || "Failed to load notifications.");
      } finally {
         setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filter]);

   useEffect(() => {
      loadNotifications();
   }, [loadNotifications]);

   const handleMarkAsRead = async (id) => {
      try {
         await markAsRead(id);
         loadNotifications(false);
      } catch {
         toast.error("Could not mark notification as read.");
      }
   };

   const handleMarkAllAsRead = async () => {
      try {
         await markAllAsRead();
         toast.success("All notifications marked as read.");
         loadNotifications(false);
      } catch {
         toast.error("Could not mark all as read.");
      }
   };

   const handleDelete = async (id) => {
      try {
         await deleteNotification(id);
         setNotifications((prev) => prev.filter((n) => n._id !== id));
         toast.info("Notification removed.");
      } catch {
         toast.error("Could not delete notification.");
      }
   };

   const visible = notifications.filter((n) =>
      filter === "read" ? n.isRead : true,
   );
   const unreadCount = notifications.filter((n) => !n.isRead).length;

   return (
      <div className="space-y-4">
         <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
               <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient text-[#0d222b]">
                  <FiBell size={18} />
               </span>
               <div>
                  <h2 className="text-[0.95rem] font-bold text-ink-900">Notifications</h2>
                  <p className="text-xs text-ink-500">
                     {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-2">
               <FilterSelect
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  options={[
                     { value: "all", label: "All" },
                     { value: "unread", label: "Unread" },
                     { value: "read", label: "Read" },
                  ]}
                  className="!w-auto"
               />
               {unreadCount > 0 && (
                  <Button variant="primary" icon={FiCheck} onClick={handleMarkAllAsRead}>
                     Mark all read
                  </Button>
               )}
            </div>
         </div>

         {loading ? (
            <TableSkeleton rows={5} cols={2} />
         ) : visible.length === 0 ? (
            <div className="surface-card">
               <EmptyState
                  icon={FiBell}
                  title="No notifications"
                  message="You have no notifications matching this filter."
               />
            </div>
         ) : (
            <div className="space-y-3">
               {visible.map((n) => {
                  const meta = TYPE_META[n.type] || TYPE_META.info;
                  const Icon = meta.icon;
                  return (
                     <div
                        key={n._id}
                        className={`surface-card flex items-start gap-4 p-4 transition hover:shadow-[var(--shadow-card-hover)] ${
                           !n.isRead ? "border-l-4 border-l-brand-400" : ""
                        }`}
                     >
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${TONE_STYLES[meta.tone]}`}>
                           <Icon size={17} />
                        </span>
                        <div className="min-w-0 flex-1">
                           <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-ink-900">{n.title}</p>
                              <span className={`badge badge-${meta.tone === "brand" ? "brand" : meta.tone}`}>
                                 {n.type}
                              </span>
                              {!n.isRead && <span className="badge badge-info">New</span>}
                           </div>
                           <p className="mt-1 text-sm text-ink-500">{n.message}</p>
                           <p className="mt-1.5 text-xs text-ink-400">
                              {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                           </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                           {!n.isRead && (
                              <button
                                 type="button"
                                 onClick={() => handleMarkAsRead(n._id)}
                                 className="btn btn-ghost btn-sm"
                              >
                                 <FiCheck size={13} /> Read
                              </button>
                           )}
                           <button
                              type="button"
                              onClick={() => handleDelete(n._id)}
                              className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-[rgba(224,82,82,0.1)] hover:text-[#c23b3b]"
                              aria-label="Delete notification"
                           >
                              <FiTrash2 size={15} />
                           </button>
                        </div>
                     </div>
                  );
               })}
            </div>
         )}
      </div>
   );
}
