import { json, options, requireConductor, isHttpError, withHandler } from "@/app/api/v1/_lib";
import { getConductorContext } from "@/server/scan";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withHandler(async (request) => {
  const conductor = await requireConductor(request);
  if (isHttpError(conductor)) return conductor;
  return json({ ok: true, conductor: await getConductorContext(conductor) });
});
