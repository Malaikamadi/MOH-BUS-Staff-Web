import { json, options, withRoles } from "@/app/api/v1/_lib";
import { getAdminDashboard } from "@/server/admin";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withRoles(["admin", "super_admin"], async () => json(await getAdminDashboard()));
