import { json, options, readBearer, withHandler } from "@/app/api/v1/_lib";
import { logoutUser } from "@/server/auth";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const POST = withHandler(async (request) => {
  await logoutUser(readBearer(request));
  return json({ ok: true });
});
