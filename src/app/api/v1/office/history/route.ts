import { json, options, withRoles } from "@/app/api/v1/_lib";
import { fromRequestUrl } from "@/lib/query";
import { listOfficeRecharges } from "@/server/office";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withRoles(["officer", "super_admin"], async (request, user) =>
  json(await listOfficeRecharges(fromRequestUrl(request.url), user.id, user.role)),
);
