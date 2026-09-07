import { json, options, withHandler } from "@/app/api/v1/_lib";
import { getAdminDashboard } from "@/server/admin";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withHandler(async () => json(await getAdminDashboard()));
