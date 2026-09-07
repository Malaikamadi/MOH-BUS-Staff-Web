import { json, options, readJson, withHandler } from "@/app/api/v1/_lib";
import { setQrStatus } from "@/server/ledger";
import type { QRStatus } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const PATCH = withHandler(async (request, context) => {
  const { id } = (await context?.params) ?? {};
  if (!id) return json({ message: "Missing QR id." }, 400);
  const body = await readJson<{ status: Exclude<QRStatus, "replaced"> }>(request);
  return json(await setQrStatus(id, body.status));
});
