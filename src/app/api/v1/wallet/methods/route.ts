import { json, options, withHandler } from "@/app/api/v1/_lib";
import { paymentMethods } from "@/server/ledger";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withHandler(async () => json(paymentMethods));
