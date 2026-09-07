import { json, options, requireConductor, isHttpError, readJson, withHandler } from "@/app/api/v1/_lib";
import { processScan } from "@/server/scan";
import type { ScanRequest } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const POST = withHandler(async (request) => {
  const conductor = await requireConductor(request);
  if (isHttpError(conductor)) return conductor;

  const body = await readJson<ScanRequest>(request);
  if (!body.payload?.trim()) {
    return json({ ok: false, code: "INVALID_QR", message: "Scan payload is required." }, 400);
  }

  const result = await processScan(conductor, body);
  const status = result.ok ? 200 : result.code === "INSUFFICIENT_BALANCE" ? 402 : 422;
  return json(result, status);
});
