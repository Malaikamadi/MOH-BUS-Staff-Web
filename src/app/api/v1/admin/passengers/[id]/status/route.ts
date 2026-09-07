import { json, options, readJson, withHandler } from "@/app/api/v1/_lib";
import { setPassengerStatus } from "@/server/admin";
import type { AccountStatus } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const PATCH = withHandler(async (request, context) => {
  const { id } = (await context?.params) ?? {};
  if (!id) return json({ message: "Missing passenger id." }, 400);
  const body = await readJson<{ status: AccountStatus }>(request);
  return json(await setPassengerStatus(id, body.status));
});
