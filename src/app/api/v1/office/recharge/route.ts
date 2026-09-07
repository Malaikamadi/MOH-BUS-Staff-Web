import { json, options, readJson, withRoles } from "@/app/api/v1/_lib";
import { processOfficeRecharge } from "@/server/office";
import type { OfficeRechargeRequest } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const POST = withRoles(["officer", "super_admin"], async (request, user) => {
  const body = await readJson<OfficeRechargeRequest>(request);
  return json(await processOfficeRecharge(body, user));
});
