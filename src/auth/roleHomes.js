/** Default landing path for each role after login or wrong-workspace redirect. */
export function roleHome(role) {
   if (role === "hr") return "/hr";
   if (role === "accountant") return "/accountant";
   if (role === "purchase_manager") return "/purchase-manager";
   if (role === "store_manager") return "/store-manager";
   if (role === "site_supervisor") return "/site-supervisor";
   if (role === "employee") return "/employee/leaves";
   return "/";
}

/** Roles that use the full admin workspace at `/`. */
export const ADMIN_WORKSPACE_ROLES = ["admin", "project_manager", "management"];
