import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { currentQr, toPassenger, toTransaction } from "@/lib/mappers";
import { dateRange, pageWindow, paginated } from "@/lib/query";
import { rechargeWallet } from "@/server/ledger";
import { HttpError } from "@/server/errors";
import type { OfficeDashboard, OfficeRechargeRequest, OfficeStaffMatch, QueryParams } from "@/types";

const DESK = "Youyi Building Headquarters — transport office";

function todayBounds() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  return { gte: start, lte: end };
}

export async function searchOfficeStaff(query: string): Promise<OfficeStaffMatch[]> {
  const search = query.trim();
  if (search.length < 2) return [];

  const contains = { contains: search, mode: "insensitive" as const };
  const rows = await prisma.passenger.findMany({
    where: {
      OR: [{ name: contains }, { staffNumber: contains }, { email: contains }, { phone: contains }],
    },
    include: { account: true, qrAccounts: true },
    take: 12,
    orderBy: { name: "asc" },
  });

  return rows.flatMap((row) => {
    if (!row.account) return [];
    const qr = currentQr(row.qrAccounts);
    return [
      {
        passenger: toPassenger(row, row.account.id, qr?.id, Number(row.account.balance)),
        account: {
          id: row.account.id,
          passengerId: row.account.passengerId,
          accountNumber: row.account.accountNumber,
          balance: Number(row.account.balance),
          status: row.account.status,
          createdAt: row.account.createdAt.toISOString(),
          updatedAt: row.account.updatedAt.toISOString(),
        },
        qrStatus: qr?.status ?? "disabled",
      },
    ];
  });
}

export async function getOfficeDashboard(actorId: string, role: string): Promise<OfficeDashboard> {
  const today = todayBounds();
  const where: Prisma.LedgerTransactionWhereInput = {
    type: "recharge",
    processedByUserId: role === "super_admin" ? { not: null } : actorId,
    createdAt: today,
  };

  const [count, sum, distinct, recent] = await Promise.all([
    prisma.ledgerTransaction.count({ where }),
    prisma.ledgerTransaction.aggregate({ where, _sum: { amount: true } }),
    prisma.ledgerTransaction.findMany({
      where,
      distinct: ["passengerId"],
      select: { passengerId: true },
    }),
    prisma.ledgerTransaction.findMany({
      where: {
        type: "recharge",
        processedByUserId: role === "super_admin" ? { not: null } : actorId,
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    desk: DESK,
    stats: {
      rechargesToday: count,
      valueToday: Number(sum._sum.amount ?? 0),
      staffHelpedToday: distinct.length,
    },
    recent: recent.map(toTransaction),
  };
}

export async function listOfficeRecharges(params: QueryParams, actorId: string, role: string) {
  const { skip, take } = pageWindow(params);
  const createdAt = dateRange(params);
  const search = params.search?.trim();
  const where: Prisma.LedgerTransactionWhereInput = {
    type: "recharge",
    processedByUserId: role === "super_admin" ? { not: null } : actorId,
    ...(createdAt ? { createdAt } : {}),
    ...(search
      ? {
          OR: [
            { passengerName: { contains: search, mode: "insensitive" } },
            { reference: { contains: search, mode: "insensitive" } },
            { processedByName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.ledgerTransaction.count({ where }),
    prisma.ledgerTransaction.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
  ]);
  return paginated(rows.map(toTransaction), total, params);
}

export async function processOfficeRecharge(
  request: OfficeRechargeRequest,
  actor: { id: string; name: string; role: string },
) {
  if (request.amount < 5) throw new HttpError(400, "The minimum head-office recharge is Le 5.00.");
  return rechargeWallet(
    {
      accountId: request.accountId,
      amount: request.amount,
      method: request.method,
      note: request.note,
    },
    actor,
  );
}
