import { json, options, withRoles } from "@/app/api/v1/_lib";
import { walletDeskRoles } from "@/lib/roles";
import { getOfficeDashboard } from "@/server/office";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withRoles(walletDeskRoles, async (_request, user) =>
  json(await getOfficeDashboard(user.id, user.role)),
);
