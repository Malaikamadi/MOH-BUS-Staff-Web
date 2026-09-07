import { json, options, withRoles } from "@/app/api/v1/_lib";
import { getSuperAdminDashboard } from "@/server/operators";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withRoles(["super_admin"], async () => json(await getSuperAdminDashboard()));
