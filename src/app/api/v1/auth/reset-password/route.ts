import { json, options, readJson, withHandler } from "@/app/api/v1/_lib";
import { resetPassword } from "@/server/auth";
import type { PasswordResetPayload } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const POST = withHandler(async (request) => {
  const body = await readJson<PasswordResetPayload>(request);
  return json(await resetPassword(body.token, body.password));
});
