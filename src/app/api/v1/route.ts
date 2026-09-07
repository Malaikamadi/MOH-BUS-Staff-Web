import { appConfig } from "@/config/app";
import { demoCredentials } from "@/data/demo";
import { prisma } from "@/lib/db";
import { json, options, withHandler } from "@/app/api/v1/_lib";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return options();
}

export const GET = withHandler(async () => {
  await prisma.$queryRaw`SELECT 1`;
  return json({
    service: appConfig.name,
    ministry: appConfig.ministry,
    database: "connected",
    qr: {
      format: `${appConfig.qr.prefix}.{secureToken}`,
      example: `${appConfig.qr.prefix}.qrt_7f3a9c2e1b8d4f6a9e0c1d2b3a4e5f67`,
      contains: "Opaque account token only. Never NIN, name or balance.",
    },
    endpoints: {
      health: "GET /api/v1",
      login: "POST /api/v1/conductor/login",
      session: "GET /api/v1/conductor/session",
      scan: "POST /api/v1/scan",
    },
    demoConductor: {
      staffNumber: demoCredentials.conductor.staffNumber,
      password: demoCredentials.conductor.password,
    },
  });
});
