const SUCCESS = ["active", "present", "approved", "delivered", "completed", "paid", "received", "selected", "issued", "in_progress", "accepted"];
const WARNING = ["pending", "draft", "on_hold", "half_day", "partial", "submitted", "in_review", "planning", "tender", "mobilized", "low_stock"];
const DANGER = ["rejected", "cancelled", "inactive", "absent", "overdue", "failed", "expired", "returned"];
const INFO = ["awarded", "mobilization", "sent", "open", "new", "generated", "converted"];

export function statusTone(status) {
   const key = String(status || "").toLowerCase();
   if (SUCCESS.includes(key)) return "success";
   if (WARNING.includes(key)) return "warning";
   if (DANGER.includes(key)) return "danger";
   if (INFO.includes(key)) return "info";
   return "neutral";
}

export function humanize(value) {
   if (!value) return "—";
   return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status, className = "" }) {
   const tone = statusTone(status);
   return (
      <span className={`badge badge-${tone} ${className}`}>
         <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
               background: {
                  success: "#22A06B",
                  warning: "#D9A441",
                  danger: "#E05252",
                  info: "#2A7B9B",
                  neutral: "#8B9CA1",
               }[tone],
            }}
         />
         {humanize(status)}
      </span>
   );
}
