import { json, options, withHandler } from "@/app/api/v1/_lib";
import { getTransaction } from "@/server/ledger";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withHandler(async (_request, context) => {
  const { id } = (await context?.params) ?? {};
  if (!id) return json({ message: "Missing transaction id." }, 400);
  return json(await getTransaction(id));
});
