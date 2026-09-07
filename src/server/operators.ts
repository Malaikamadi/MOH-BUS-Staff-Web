import { prisma } from "@/lib/db";
import { newId } from "@/lib/ids";
import { toTransaction, toUser } from "@/lib/mappers";
import { hashPassword } from "@/lib/password";
import { HttpError } from "@/server/errors";
import type { AccountStatus, OperatorDraft, SuperAdminDashboard } from "@/types";

function todayBounds() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  return { gte: start, lte: end };
}

export async function getSuperAdminDashboard(): Promise<SuperAdminDashboard> {
  const today = todayBounds();
  const officeWhere = { type: "recharge" as const, processedByUserId: { not: null } };

  const [
    totalUsers,
    superAdmins,
    admins,
    officers,
    staff,
    walletFloat,
    officeToday,
    officeValue,
    operators,
    recentOfficeRecharges,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "super_admin" } }),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.user.count({ where: { role: "officer" } }),
    prisma.user.count({ where: { role: "passenger" } }),
    prisma.transportAccount.aggregate({ _sum: { balance: true } }),
    prisma.ledgerTransaction.count({ where: { ...officeWhere, createdAt: today } }),
    prisma.ledgerTransaction.aggregate({
      where: { ...officeWhere, createdAt: today },
      _sum: { amount: true },
    }),
    prisma.user.findMany({
      where: { role: { in: ["super_admin", "admin", "officer"] } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ledgerTransaction.findMany({
      where: officeWhere,
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    stats: {
      totalUsers,
      superAdmins,
      admins,
      officers,
      staff,
      walletFloat: Number(walletFloat._sum.balance ?? 0),
      officeRechargesToday: officeToday,
      officeValueToday: Number(officeValue._sum.amount ?? 0),
    },
    operators: operators.map(toUser),
    recentOfficeRecharges: recentOfficeRecharges.map(toTransaction),
  };
}

export async function listOperators() {
  const rows = await prisma.user.findMany({
    where: { role: { in: ["super_admin", "admin", "officer"] } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
  return rows.map(toUser);
}

export async function createOperator(input: OperatorDraft) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "An operator with this email already exists.");
  if (input.password.length < 8) throw new HttpError(400, "Password must be at least 8 characters.");
  if (input.role !== "admin" && input.role !== "officer") {
    throw new HttpError(400, "New operators must be an administrator or a recharge clerk.");
  }

  const row = await prisma.user.create({
    data: {
      id: newId("usr"),
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      passwordHash: await hashPassword(input.password),
      role: input.role,
      status: "active",
      createdAt: new Date(),
    },
  });
  return toUser(row);
}

export async function setOperatorStatus(id: string, status: AccountStatus) {
  const row = await prisma.user.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, "Operator not found.");
  if (row.role === "super_admin") {
    throw new HttpError(403, "A super administrator account cannot be changed from this screen.");
  }
  if (row.role === "passenger") throw new HttpError(400, "Staff accounts are managed from operations.");
  return toUser(await prisma.user.update({ where: { id }, data: { status } }));
}
