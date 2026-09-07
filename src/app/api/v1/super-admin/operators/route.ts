import { json, options, readJson, withRoles } from "@/app/api/v1/_lib";
import { createOperator, listOperators } from "@/server/operators";
import type { OperatorDraft } from "@/types";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withRoles(["super_admin"], async () => json(await listOperators()));

export const POST = withRoles(["super_admin"], async (request) => {
  const body = await readJson<OperatorDraft>(request);
  return json(await createOperator(body), 201);
});
