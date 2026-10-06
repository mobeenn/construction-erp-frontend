export const permissionRoles = {
   admin: "all",
   project_manager: {
      projects: ["view", "edit"], activities: ["view", "create", "edit"],
      progress: ["view", "create", "approve", "reject"], clients: ["view"], contracts: ["view"],
      procurement: ["view", "create", "approve", "reject"], inventory: ["view"], expenses: ["view"],
      interim_payments: ["view", "approve", "reject"], accounting: [], employees: ["view"],
      attendance: ["view"], leave: ["view", "create", "approve", "reject"], payroll: ["view"],
      reports: ["view", "export"], documents: ["view", "create", "edit"],
   },
   site_supervisor: {
      projects: ["view"], activities: ["view", "create", "edit"], progress: ["view", "create"],
      clients: ["view"], contracts: ["view"], procurement: ["view", "create"],
      inventory: ["view", "create"], expenses: ["view", "create"], interim_payments: ["view", "create"],
      accounting: [], employees: ["view"], attendance: ["view", "create"], leave: ["view", "create", "approve", "reject"],
      payroll: [], reports: ["view"], documents: ["view", "create"],
   },
   hr: {
      projects: ["view"], activities: ["view"], progress: ["view"], clients: ["view"], contracts: ["view"],
      procurement: ["view"], inventory: ["view"], expenses: ["view"], interim_payments: ["view"],
      accounting: ["view"], employees: ["view", "create", "edit"], attendance: ["view", "create", "edit", "export"],
      leave: ["view", "create", "approve", "reject", "manage"], payroll: ["view", "create", "edit", "approve", "export", "manage"],
      reports: ["view", "export"], documents: ["view", "create", "edit"],
   },
   accountant: {
      projects: ["view"], activities: ["view"], progress: ["view"], clients: ["view"], contracts: ["view"],
      procurement: ["view"], inventory: ["view"], expenses: ["view", "create", "edit", "export"],
      interim_payments: ["view", "payment", "manage"], accounting: ["view", "create", "edit", "delete", "approve", "reject", "export", "payment", "manage"],
      employees: ["view"], attendance: ["view"], leave: [], payroll: ["view", "export"],
      reports: ["view", "export"], documents: ["view"],
   },
   purchase_manager: {
      projects: ["view"], activities: ["view"], progress: ["view"], clients: ["view"], contracts: ["view"],
      procurement: ["view", "create", "edit", "approve", "reject", "export", "manage"],
      inventory: ["view"], expenses: ["view"], interim_payments: ["view"], accounting: ["view"],
      employees: ["view"], attendance: ["view"], leave: [], payroll: [], reports: ["view", "export"], documents: ["view", "create"],
   },
   store_manager: {
      projects: ["view"], activities: ["view"], progress: ["view"], clients: ["view"], contracts: ["view"],
      procurement: ["view"], inventory: ["view", "create", "edit", "delete", "approve", "reject", "manage", "export"],
      expenses: ["view"], interim_payments: ["view"], accounting: ["view"], employees: ["view"], attendance: ["view"],
      leave: [], payroll: [], reports: ["view", "export"], documents: ["view", "create"],
   },
   management: Object.fromEntries([
      "projects", "activities", "progress", "clients", "contracts", "procurement", "inventory", "expenses",
      "interim_payments", "accounting", "employees", "attendance", "leave", "payroll", "reports", "documents",
   ].map((resource) => [resource, ["view", "export"]])),
   employee: {
      projects: ["view"], activities: ["view"], progress: ["view"], clients: [], contracts: [], procurement: [],
      inventory: [], expenses: [], interim_payments: [], accounting: [], employees: [], attendance: ["view"],
      leave: ["view", "create"], payroll: ["view"], reports: [], documents: ["view"],
   },
};

export function can(user, resource, action) {
   if (!user) return false;
   if (user.role === "admin") return true;
   const explicit = user.permissions?.[resource];
   if (Array.isArray(explicit)) return explicit.includes(action);
   if (explicit && typeof explicit === "object" && typeof explicit[action] === "boolean") return explicit[action];
   const rolePermissions = permissionRoles[user.role];
   if (rolePermissions === "all") return true;
   return Boolean(rolePermissions?.[resource]?.includes(action));
}

export function canAny(user, checks) {
   return checks.some(([resource, action]) => can(user, resource, action));
}
