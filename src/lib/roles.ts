import { routes } from "@/config/routes";
import type { UserRole } from "@/types";

export function homeFor(role: UserRole) {
  switch (role) {
    case "super_admin":
      return routes.superAdmin.dashboard;
    case "admin":
      return routes.admin.dashboard;
    case "officer":
      return routes.office.dashboard;
    default:
      return routes.portal.dashboard;
  }
}

export const walletDeskRoles: UserRole[] = ["officer", "admin", "super_admin"];

export function canAccessAdmin(role: UserRole) {
  return role === "admin" || role === "super_admin";
}

export function canAccessOffice(role: UserRole) {
  return role === "officer" || role === "admin" || role === "super_admin";
}

export function canRechargeWallets(role: UserRole) {
  return walletDeskRoles.includes(role);
}

export function canAccessSuperAdmin(role: UserRole) {
  return role === "super_admin";
}

export function canAccessPortal(role: UserRole) {
  return role === "passenger";
}

export function roleLabel(role: UserRole) {
  switch (role) {
    case "super_admin":
      return "Super administrator";
    case "admin":
      return "Operations administrator";
    case "officer":
      return "Head office recharge clerk";
    default:
      return "Ministry staff";
  }
}
