import { json, options, withHandler } from "@/app/api/v1/_lib";
import { getWallet } from "@/server/ledger";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withHandler(async (_request, context) => {
  const { accountId } = (await context?.params) ?? {};
  if (!accountId) return json({ message: "Missing account id." }, 400);
  return json(await getWallet(accountId));
});
