import { json, options, readJson, withHandler } from "@/app/api/v1/_lib";
import { requestPasswordReset } from "@/server/auth";
import type { PasswordResetRequest } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const POST = withHandler(async (request) => {
  const body = await readJson<PasswordResetRequest>(request);
  return json(await requestPasswordReset(body.email));
});
