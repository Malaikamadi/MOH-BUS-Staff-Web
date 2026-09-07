import { json, options, readJson, requireUser, isHttpError, withHandler } from "@/app/api/v1/_lib";
import { rechargeWallet } from "@/server/ledger";
import type { RechargeRequest } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const POST = withHandler(async (request) => {
  const user = await requireUser(request);
  if (isHttpError(user)) return user;
  const body = await readJson<RechargeRequest>(request);
  return json(await rechargeWallet(body, user));
});
