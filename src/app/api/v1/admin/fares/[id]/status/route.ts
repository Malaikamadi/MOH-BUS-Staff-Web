import { json, options, readJson, withHandler } from "@/app/api/v1/_lib";
import { setFareStatus } from "@/server/admin";
import type { EntityStatus } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const PATCH = withHandler(async (request, context) => {
  const { id } = (await context?.params) ?? {};
  if (!id) return json({ message: "Missing fare id." }, 400);
  const body = await readJson<{ status: EntityStatus }>(request);
  return json(await setFareStatus(id, body.status));
});
