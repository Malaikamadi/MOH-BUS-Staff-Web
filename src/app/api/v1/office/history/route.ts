import { json, options, withRoles } from "@/app/api/v1/_lib";
import { fromRequestUrl } from "@/lib/query";
import { walletDeskRoles } from "@/lib/roles";
import { listOfficeRecharges } from "@/server/office";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withRoles(walletDeskRoles, async (request, user) =>
  json(await listOfficeRecharges(fromRequestUrl(request.url), user.id, user.role)),
);
