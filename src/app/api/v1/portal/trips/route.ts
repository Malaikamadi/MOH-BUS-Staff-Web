import { json, options, requireUser, isHttpError, withHandler } from "@/app/api/v1/_lib";
import { getStaffProfileForUser } from "@/server/auth";
import { listTrips } from "@/server/ledger";
import { fromRequestUrl } from "@/lib/query";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withHandler(async (request) => {
  const user = await requireUser(request);
  if (isHttpError(user)) return user;
  const profile = await getStaffProfileForUser(user.id);
  return json(await listTrips(fromRequestUrl(request.url), profile.passenger.id));
});
