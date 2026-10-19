/**
 * Role-based access control (RBAC) for the admin panel.
 *
 * The backend only knows four staff role slugs (admin / manager / staff /
 * viewer — see RegisterDto in the NestJS API), so this file is the single
 * source of truth for what each role may do in the admin UI.
 *
 * These checks are UI/UX enforcement. The API must still enforce permissions
 * server-side for real security.
 */

export const ACTIONS = ["view", "create", "edit", "delete"];

export const MODULES = [
  { key: "dashboard", label: "Dashboard" },
  { key: "products", label: "Product Management" },
  { key: "pricing", label: "Pricing Engine" },
  { key: "orders", label: "Order Management" },
  { key: "custom_jewelry", label: "Custom Jewelry" },
  { key: "customers", label: "Customer Data" },
  { key: "coupons", label: "Coupons Management" },
  { key: "communication", label: "Communication" },
  { key: "cms", label: "CMS" },
  { key: "enterprise", label: "Advanced (Enterprise)" },
  { key: "settings", label: "Settings" },
  { key: "users_roles", label: "Users, Roles & Departments" },
];

export const ROLES = [
  {
    key: "admin",
    name: "Admin",
    description: "Full access to every module, including users, roles and settings.",
  },
  {
    key: "manager",
    name: "Manager",
    description: "Manage catalog, pricing, orders and store configuration. No user administration.",
  },
  {
    key: "staff",
    name: "Staff",
    description: "Create and edit products, orders and customers. Pricing is view-only.",
  },
  {
    key: "viewer",
    name: "Viewer",
    description: "Read-only access to business modules. No configuration or user management.",
  },
];

const ALL = { view: true, create: true, edit: true, delete: true };
const EDIT = { view: true, create: true, edit: true, delete: false };
const VIEW = { view: true, create: false, edit: false, delete: false };
const NONE = { view: false, create: false, edit: false, delete: false };

const modulesWith = (permission, overrides = {}) =>
  Object.fromEntries(
    MODULES.map((module) => [
      module.key,
      { ...(overrides[module.key] || permission) },
    ])
  );

export const ROLE_PERMISSIONS = {
  admin: modulesWith(ALL, {
    dashboard: VIEW,
  }),

  manager: modulesWith(EDIT, {
    dashboard: VIEW,
    // Advanced entity managers are full CRUD for managers; staff have no access.
    enterprise: ALL,
    // Managers can manage currencies; user administration stays admin-only.
    settings: ALL,
    users_roles: NONE,
  }),

  staff: modulesWith(EDIT, {
    dashboard: VIEW,
    pricing: VIEW,
    coupons: VIEW,
    cms: VIEW,
    enterprise: NONE,
    settings: NONE,
    users_roles: NONE,
  }),

  viewer: modulesWith(VIEW, {
    enterprise: NONE,
    settings: NONE,
    users_roles: NONE,
  }),
};

/**
 * Route prefixes mapped to a module. Longest prefix wins.
 * Paths not listed fall back to the dashboard module.
 */
const ROUTE_MODULES = [
  ["/dashboard/product-management", "products"],
  ["/dashboard/product-categories", "products"],
  ["/dashboard/catalog", "enterprise"],
  ["/dashboard/pricing", "pricing"],
  ["/dashboard/order-management", "orders"],
  ["/dashboard/custom-jewelary", "custom_jewelry"],
  ["/dashboard/customer-data", "customers"],
  ["/dashboard/coupons-management", "coupons"],
  ["/dashboard/communication", "communication"],
  ["/dashboard/support", "communication"],
  ["/dashboard/cms", "cms"],
  ["/dashboard/enterprise", "enterprise"],
  ["/dashboard/currency-management", "settings"],
  ["/dashboard/users-roles", "users_roles"],
  ["/dashboard/all-user-list", "users_roles"],
  ["/dashboard/department", "users_roles"],
];

export function normalizeRole(role) {
  const raw =
    typeof role === "string"
      ? role
      : role?.slug || role?.name || role?.key || role?.id || "";

  const key = String(raw).trim().toLowerCase().replace(/[\s-]+/g, "_");

  // The old stub API exposed super_admin, but the backend does not accept it.
  if (key === "super_admin") return "admin";
  if (ROLE_PERMISSIONS[key]) return key;

  // Unknown / missing role: safest supported role.
  return "viewer";
}

export function getRoleMeta(role) {
  const key = normalizeRole(role);
  return ROLES.find((item) => item.key === key) || ROLES[ROLES.length - 1];
}

export function getModuleForPath(pathname) {
  if (!pathname) return "dashboard";

  const match = ROUTE_MODULES.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  return match ? match[1] : "dashboard";
}

export function hasPermission(role, module, action = "view") {
  const key = normalizeRole(role);
  return Boolean(ROLE_PERMISSIONS[key]?.[module]?.[action]);
}

export function canAccessPath(role, pathname) {
  const module = getModuleForPath(pathname);
  return hasPermission(role, module, "view");
}
