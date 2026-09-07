import { json, options, withHandler } from "@/app/api/v1/_lib";
import { listTrips } from "@/server/ledger";
import { fromRequestUrl } from "@/lib/query";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withHandler(async (request) => json(await listTrips(fromRequestUrl(request.url))));
