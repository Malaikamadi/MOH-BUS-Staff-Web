import { json, options, withRoles } from "@/app/api/v1/_lib";
import { getOfficeDashboard } from "@/server/office";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withRoles(["officer", "super_admin"], async (_request, user) =>
  json(await getOfficeDashboard(user.id, user.role)),
);
