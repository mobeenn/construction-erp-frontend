import { FiLoader } from "react-icons/fi";

const VARIANTS = {
   primary: "btn-primary",
   secondary: "btn-secondary",
   ghost: "btn-ghost",
   danger: "btn-danger",
};

export default function Button({
   children,
   variant = "secondary",
   size = "md",
   icon: Icon,
   iconRight: IconRight,
   loading = false,
   className = "",
   type = "button",
   ...rest
}) {
   const classes = [
      "btn",
      VARIANTS[variant] || VARIANTS.secondary,
      size === "sm" ? "btn-sm" : "",
      className,
   ]
      .filter(Boolean)
      .join(" ");

   return (
      <button type={type} className={classes} disabled={loading || rest.disabled} {...rest}>
         {loading ? (
            <FiLoader className="animate-spin" size={15} />
         ) : (
            Icon && <Icon size={size === "sm" ? 14 : 16} />
         )}
         {children}
         {IconRight && !loading && <IconRight size={size === "sm" ? 14 : 16} />}
      </button>
   );
}
