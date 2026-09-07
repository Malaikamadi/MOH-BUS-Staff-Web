import { json, options, readJson, withHandler } from "@/app/api/v1/_lib";
import { registerStaff } from "@/server/auth";
import type { RegistrationPayload } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const POST = withHandler(async (request) => {
  const body = await readJson<RegistrationPayload>(request);
  const session = await registerStaff(body);
  return json(session);
});
