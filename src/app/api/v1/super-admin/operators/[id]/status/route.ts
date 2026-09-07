import { json, options, readJson, withRoles } from "@/app/api/v1/_lib";
import { setOperatorStatus } from "@/server/operators";
import type { AccountStatus } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const PATCH = withRoles(["super_admin"], async (request, _user, context) => {
  const { id } = (await context?.params) ?? {};
  if (!id) return json({ message: "Missing operator id." }, 400);
  const body = await readJson<{ status: AccountStatus }>(request);
  return json(await setOperatorStatus(id, body.status));
});
