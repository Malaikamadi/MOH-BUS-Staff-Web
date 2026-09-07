import { NextResponse } from "next/server";

import { userFromToken } from "@/server/auth";
import { HttpError } from "@/server/errors";
import { conductorFromToken } from "@/server/scan";
import type { Conductor, UserRole } from "@/types";
import type { User as DbUser } from "@prisma/client";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: corsHeaders });
}

export function options() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export function readBearer(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

export async function requireConductor(request: Request): Promise<Conductor | NextResponse> {
  const conductor = await conductorFromToken(readBearer(request));
  if (!conductor) {
    return json(
      { ok: false, code: "UNAUTHORISED", message: "Sign in again to continue scanning." },
      401,
    );
  }
  return conductor;
}

export async function requireUser(request: Request): Promise<DbUser | NextResponse> {
  const user = await userFromToken(readBearer(request));
  if (!user) {
    return json({ message: "Sign in again to continue." }, 401);
  }
  return user;
}

export function isHttpError(value: Conductor | DbUser | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

export async function requireRoles(request: Request, roles: UserRole[]): Promise<DbUser | NextResponse> {
  const user = await requireUser(request);
  if (isHttpError(user)) return user;
  if (!roles.includes(user.role)) {
    return json({ message: "You do not have access to this desk." }, 403);
  }
  return user;
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new HttpError(400, "Invalid request body.");
  }
}

type RouteContext = { params: Promise<Record<string, string>> };

export function withHandler(
  handler: (request: Request, context?: RouteContext) => Promise<Response>,
) {
  return async (request: Request, context?: RouteContext) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ ok: false, message: error.message, code: error.code }, error.status);
      }
      console.error(error);
      return json({ ok: false, message: "Unable to complete this request." }, 500);
    }
  };
}

export function withRoles(
  roles: UserRole[],
  handler: (request: Request, user: DbUser, context?: RouteContext) => Promise<Response>,
) {
  return withHandler(async (request, context) => {
    const user = await requireRoles(request, roles);
    if (isHttpError(user)) return user;
    return handler(request, user, context);
  });
}
