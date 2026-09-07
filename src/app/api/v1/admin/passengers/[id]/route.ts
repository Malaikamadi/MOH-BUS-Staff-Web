import { json, options, withHandler } from "@/app/api/v1/_lib";
import { getPassenger } from "@/server/admin";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withHandler(async (_request, context) => {
  const { id } = (await context?.params) ?? {};
  if (!id) return json({ message: "Missing passenger id." }, 400);
  return json(await getPassenger(id));
});
