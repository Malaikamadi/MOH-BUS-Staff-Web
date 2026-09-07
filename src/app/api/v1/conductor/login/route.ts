import type { ConductorLoginRequest } from "@/types";
import { json, options, readJson, withHandler } from "@/app/api/v1/_lib";
import { loginConductor } from "@/server/scan";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const POST = withHandler(async (request) => {
  const body = await readJson<ConductorLoginRequest>(request);
  if (!body.staffNumber || !body.password) {
    return json({ ok: false, code: "UNAUTHORISED", message: "Staff number and password are required." }, 400);
  }
  const session = await loginConductor(body);
  return json({ ok: true, ...session });
});
