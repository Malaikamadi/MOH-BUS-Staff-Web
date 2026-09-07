/** Single source of truth for application paths. */
export const routes = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  admin: {
    dashboard: "/admin",
    passengers: "/admin/passengers",
    passenger: (id: string) => `/admin/passengers/${id}`,
    qrAccounts: "/admin/qr-accounts",
    conductors: "/admin/conductors",
    buses: "/admin/buses",
    routes: "/admin/routes",
    fares: "/admin/fares",
    trips: "/admin/trips",
    transactions: "/admin/transactions",
    transaction: (id: string) => `/admin/transactions/${id}`,
    reports: "/admin/reports",
    settings: "/admin/settings",
  },

  portal: {
    dashboard: "/portal",
    qr: "/portal/qr",
    recharge: "/portal/recharge",
    transactions: "/portal/transactions",
    trips: "/portal/trips",
    profile: "/portal/profile",
  },
} as const;

export const ADMIN_ROUTE_PREFIX = "/admin";
export const PORTAL_ROUTE_PREFIX = "/portal";
