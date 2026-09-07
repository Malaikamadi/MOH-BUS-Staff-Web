import { json, options, readJson, withHandler } from "@/app/api/v1/_lib";
import { loginWithPassword } from "@/server/auth";
import type { LoginCredentials } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const POST = withHandler(async (request) => {
  const body = await readJson<LoginCredentials>(request);
  const session = await loginWithPassword(body);
  return json(session);
});
