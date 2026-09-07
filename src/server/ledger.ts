import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { newId, newReference, newToken } from "@/lib/ids";
import { toQr, toTransaction, toTrip } from "@/lib/mappers";
import { dateRange, pageWindow, paginated } from "@/lib/query";
import { HttpError } from "@/server/errors";
import type {
  PaymentMethod,
  QRStatus,
  QueryParams,
  RechargeRequest,
  TransactionStatus,
  TransactionType,
  TripStatus,
} from "@/types";

function contains(search?: string) {
  if (!search?.trim()) return undefined;
  return { contains: search.trim(), mode: "insensitive" as const };
}

export const paymentMethods: PaymentMethod[] = [
  { id: "mobile_money", label: "Orange Money / Afrimoney", description: "Instant credit to your staff wallet", feePercent: 0, enabled: true },
  { id: "bank_transfer", label: "Bank transfer", description: "Credited once the bank confirms payment", feePercent: 0, enabled: true },
  { id: "card", label: "Debit or credit card", description: "Available at any time", feePercent: 1.5, enabled: true },
  { id: "agent", label: "Facility transport office", description: "Cash top-up at your duty station", feePercent: 0, enabled: true },
];

export async function listQrAccounts(params: QueryParams = {}) {
  const { skip, take } = pageWindow(params);
  const search = contains(params.search);
  const status = params.filters?.status as QRStatus | undefined;
  const createdAt = dateRange(params);
  const where: Prisma.QrAccountWhereInput = {
    ...(status ? { status } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(search ? { OR: [{ passengerName: search }, { secureToken: search }, { id: search }] } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.qrAccount.count({ where }),
    prisma.qrAccount.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
  ]);
  return paginated(rows.map(toQr), total, params);
}

export async function setQrStatus(id: string, status: Exclude<QRStatus, "replaced">) {
  const qr = await prisma.qrAccount.findUnique({ where: { id } });
  if (!qr) throw new HttpError(404, "QR account not found.");
  await prisma.qrAccount.update({
    where: { id },
    data: { status, revokedAt: status === "disabled" ? new Date() : qr.revokedAt },
  });
  return { success: true, message: status === "disabled" ? "QR disabled." : "QR reactivated." };
}

export async function replaceQr(id: string) {
  const current = await prisma.qrAccount.findUnique({ where: { id } });
  if (!current) throw new HttpError(404, "QR account not found.");
  const now = new Date();
  const replacementId = newId("qr");
  const [, replacement] = await prisma.$transaction([
    prisma.qrAccount.update({
      where: { id },
      data: { status: "replaced", revokedAt: now, replacedByQrId: replacementId },
    }),
    prisma.qrAccount.create({
      data: {
        id: replacementId,
        accountId: current.accountId,
        passengerId: current.passengerId,
        passengerName: current.passengerName,
        secureToken: newToken(),
        status: "active",
        createdAt: now,
        scanCount: 0,
      },
    }),
  ]);
  return toQr(replacement);
}

export async function listTransactions(params: QueryParams = {}, passengerId?: string) {
  const { skip, take } = pageWindow(params);
  const search = contains(params.search);
  const type = params.filters?.type as TransactionType | undefined;
  const status = params.filters?.status as TransactionStatus | undefined;
  const createdAt = dateRange(params);
  const where: Prisma.LedgerTransactionWhereInput = {
    ...(passengerId ? { passengerId } : {}),
    ...(type ? { type } : {}),
    ...(status ? { status } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(search
      ? { OR: [{ reference: search }, { passengerName: search }, { description: search }, { id: search }] }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.ledgerTransaction.count({ where }),
    prisma.ledgerTransaction.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
  ]);
  return paginated(rows.map(toTransaction), total, params);
}

export async function getTransaction(id: string) {
  const row = await prisma.ledgerTransaction.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, "Transaction not found.");
  return toTransaction(row);
}

export async function listTrips(params: QueryParams = {}, passengerId?: string) {
  const { skip, take } = pageWindow(params);
  const search = contains(params.search);
  const status = params.filters?.status as TripStatus | undefined;
  const routeId = params.filters?.routeId;
  const createdAt = dateRange(params);
  const where: Prisma.TripWhereInput = {
    ...(passengerId ? { passengerId } : {}),
    ...(status ? { status } : {}),
    ...(routeId ? { routeId } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(search
      ? {
          OR: [
            { reference: search },
            { passengerName: search },
            { routeName: search },
            { busNumber: search },
            { conductorName: search },
          ],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.trip.count({ where }),
    prisma.trip.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
  ]);
  return paginated(rows.map(toTrip), total, params);
}

export async function getWallet(accountId: string) {
  const account = await prisma.transportAccount.findUnique({ where: { id: accountId } });
  if (!account) throw new HttpError(404, "Wallet not found.");
  return {
    id: account.id,
    passengerId: account.passengerId,
    accountNumber: account.accountNumber,
    balance: Number(account.balance),
    status: account.status,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
  };
}

export async function rechargeWallet(request: RechargeRequest) {
  if (request.amount < 5) throw new HttpError(400, "The minimum recharge is Le 5.00.");
  const account = await prisma.transportAccount.findUnique({
    where: { id: request.accountId },
    include: { passenger: true },
  });
  if (!account) throw new HttpError(404, "Wallet not found.");
  if (account.status !== "active") throw new HttpError(400, "This wallet cannot accept a recharge.");

  const now = new Date();
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.transportAccount.update({
      where: { id: account.id },
      data: { balance: { increment: request.amount }, updatedAt: now },
    });
    const transaction = await tx.ledgerTransaction.create({
      data: {
        id: newId("txn"),
        reference: newReference("TXN"),
        accountId: account.id,
        passengerId: account.passengerId,
        passengerName: account.passenger.name,
        type: "recharge",
        description: `Wallet recharge · ${request.method.replace("_", " ")}`,
        amount: request.amount,
        balanceAfter: updated.balance,
        status: "successful",
        method: request.method,
        createdAt: now,
      },
    });
    return { transaction, balance: Number(updated.balance) };
  });

  return { transaction: toTransaction(result.transaction), balance: result.balance };
}

export async function getActiveQrForPassenger(passengerId: string) {
  const qr = await prisma.qrAccount.findFirst({
    where: { passengerId, status: "active" },
    orderBy: { createdAt: "desc" },
  });
  if (!qr) throw new HttpError(404, "QR account not found.");
  return toQr(qr);
}
