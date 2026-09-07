import { json, options, requireUser, isHttpError, withHandler } from "@/app/api/v1/_lib";
import { getStaffProfileForUser } from "@/server/auth";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withHandler(async (request) => {
  const user = await requireUser(request);
  if (isHttpError(user)) return user;
  return json(await getStaffProfileForUser(user.id));
});
