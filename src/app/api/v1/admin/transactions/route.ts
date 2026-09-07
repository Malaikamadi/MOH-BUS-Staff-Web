import { json, options, withHandler } from "@/app/api/v1/_lib";
import { listTransactions } from "@/server/ledger";
import { fromRequestUrl } from "@/lib/query";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withHandler(async (request) => json(await listTransactions(fromRequestUrl(request.url))));
