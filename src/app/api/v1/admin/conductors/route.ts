import { json, options, readJson, withHandler } from "@/app/api/v1/_lib";
import { createConductor, listConductors } from "@/server/admin";
import { fromRequestUrl } from "@/lib/query";
import type { Conductor } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withHandler(async (request) => json(await listConductors(fromRequestUrl(request.url))));

export const POST = withHandler(async (request) => {
  const body = await readJson<Pick<Conductor, "name" | "contact" | "email" | "staffNumber">>(request);
  return json(await createConductor(body), 201);
});
