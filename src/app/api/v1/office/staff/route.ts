import { json, options, withRoles } from "@/app/api/v1/_lib";
import { walletDeskRoles } from "@/lib/roles";
import { searchOfficeStaff } from "@/server/office";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withRoles(["officer", "super_admin"], async (request) => {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  return json(await searchOfficeStaff(query));
});
