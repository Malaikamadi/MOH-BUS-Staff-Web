import { json, options, readJson, withHandler } from "@/app/api/v1/_lib";
import { setConductorStatus } from "@/server/admin";
import type { Conductor } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const PATCH = withHandler(async (request, context) => {
  const { id } = (await context?.params) ?? {};
  if (!id) return json({ message: "Missing conductor id." }, 400);
  const body = await readJson<{ status: Conductor["status"] }>(request);
  return json(await setConductorStatus(id, body.status));
});
