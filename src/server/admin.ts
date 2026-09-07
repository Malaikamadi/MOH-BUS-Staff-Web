import { Prisma } from "@prisma/client";

import { appConfig } from "@/config/app";
import { prisma } from "@/lib/db";
import { newId } from "@/lib/ids";
import {
  toBus,
  toConductor,
  toFare,
  toPassenger,
  toPassengerDetail,
  toRoute,
  toTransaction,
  toTrip,
} from "@/lib/mappers";
import { hashPassword } from "@/lib/password";
import { dateRange, pageWindow, paginated } from "@/lib/query";
import { HttpError } from "@/server/errors";
import type {
  AccountStatus,
  AdminDashboardData,
  Conductor,
  EntityStatus,
  QueryParams,
  ReportBundle,
  TimeSeriesPoint,
} from "@/types";

function contains(search?: string) {
  if (!search?.trim()) return undefined;
  return { contains: search.trim(), mode: "insensitive" as const };
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setUTCHours(23, 59, 59, 999);

  const [
    totalPassengers,
    activeQrAccounts,
    tripsToday,
    completedToday,
    failedToday,
    walletFloat,
    lowBalanceAccounts,
    activeConductors,
    fareCount,
    rechargeCount,
    refundCount,
    adjustmentCount,
    recentTransactions,
    recentTrips,
    failedTransactions,
    lowBalance,
  ] = await Promise.all([
    prisma.passenger.count(),
    prisma.qrAccount.count({ where: { status: "active" } }),
    prisma.trip.count({ where: { createdAt: { gte: todayStart, lte: todayEnd } } }),
    prisma.trip.findMany({
      where: { createdAt: { gte: todayStart, lte: todayEnd }, status: "completed" },
    }),
    prisma.ledgerTransaction.count({
      where: { createdAt: { gte: todayStart, lte: todayEnd }, status: "failed" },
    }),
    prisma.transportAccount.aggregate({ _sum: { balance: true } }),
    prisma.transportAccount.count({
      where: { status: "active", balance: { lte: appConfig.lowBalanceThreshold } },
    }),
    prisma.conductor.count({ where: { status: "active" } }),
    prisma.ledgerTransaction.count({ where: { type: "fare" } }),
    prisma.ledgerTransaction.count({ where: { type: "recharge" } }),
    prisma.ledgerTransaction.count({ where: { type: "refund" } }),
    prisma.ledgerTransaction.count({ where: { type: "adjustment" } }),
    prisma.ledgerTransaction.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.trip.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.ledgerTransaction.findMany({ where: { status: "failed" }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.transportAccount.findMany({
      where: { balance: { lte: appConfig.lowBalanceThreshold } },
      include: { passenger: true },
      take: 12,
    }),
  ]);

  const revenueToday = completedToday.reduce((sum, row) => sum + Number(row.fare), 0);
  const series: TimeSeriesPoint[] = [];
  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - index);
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + 1);
    const key = date.toISOString().slice(0, 10);
    const dayTrips = await prisma.trip.findMany({
      where: { createdAt: { gte: date, lt: next }, status: "completed" },
    });
    series.push({
      label: date.toLocaleDateString("en-SL", { weekday: "short", timeZone: "UTC" }),
      date: key,
      trips: dayTrips.length,
      revenue: dayTrips.reduce((sum, row) => sum + Number(row.fare), 0),
    });
  }

  return {
    stats: {
      totalPassengers,
      passengerGrowthPercent: 0,
      activeQrAccounts,
      qrGrowthPercent: 0,
      tripsToday,
      tripsGrowthPercent: 0,
      revenueToday,
      revenueGrowthPercent: 0,
      walletFloat: Number(walletFloat._sum.balance ?? 0),
      failedTransactionsToday: failedToday,
      lowBalanceAccounts,
      activeConductors,
    },
    series,
    transactionMix: [
      { type: "Fare", value: fareCount },
      { type: "Recharge", value: rechargeCount },
      { type: "Refund", value: refundCount },
      { type: "Adjustment", value: adjustmentCount },
    ],
    recentTransactions: recentTransactions.map(toTransaction),
    recentTrips: recentTrips.map(toTrip),
    failedTransactions: failedTransactions.map(toTransaction),
    lowBalanceAccounts: lowBalance.map((row) => ({
      accountId: row.id,
      passengerId: row.passengerId,
      passengerName: row.passenger.name,
      accountNumber: row.accountNumber,
      balance: Number(row.balance),
    })),
  };
}

export async function listConductors(params: QueryParams = {}) {
  const { skip, take } = pageWindow(params);
  const search = contains(params.search);
  const where: Prisma.ConductorWhereInput = search
    ? { OR: [{ name: search }, { staffNumber: search }, { contact: search }] }
    : {};
  const [total, rows] = await Promise.all([
    prisma.conductor.count({ where }),
    prisma.conductor.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
  ]);
  return paginated(rows.map(toConductor), total, params);
}

export async function createConductor(input: Pick<Conductor, "name" | "contact" | "email" | "staffNumber">) {
  const staffNumber = input.staffNumber.trim().toUpperCase();
  const existing = await prisma.conductor.findUnique({ where: { staffNumber } });
  if (existing) throw new HttpError(409, "A conductor with this staff number already exists.");
  const row = await prisma.conductor.create({
    data: {
      id: newId("cnd"),
      staffNumber,
      name: input.name,
      contact: input.contact,
      email: input.email,
      passwordHash: await hashPassword("Password123"),
      status: "active",
      tripsProcessed: 0,
      createdAt: new Date(),
    },
  });
  return toConductor(row);
}

export async function setConductorStatus(id: string, status: Conductor["status"]) {
  const row = await prisma.conductor.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, "Conductor not found.");
  return toConductor(await prisma.conductor.update({ where: { id }, data: { status } }));
}

export async function listBuses(params: QueryParams = {}) {
  const { skip, take } = pageWindow(params);
  const search = contains(params.search);
  const where: Prisma.BusWhereInput = search
    ? { OR: [{ busNumber: search }, { registrationNumber: search }, { routeName: search }] }
    : {};
  const [total, rows] = await Promise.all([
    prisma.bus.count({ where }),
    prisma.bus.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
  ]);
  return paginated(rows.map(toBus), total, params);
}

export async function listRoutes(params: QueryParams = {}) {
  const { skip, take } = pageWindow(params);
  const search = contains(params.search);
  const where: Prisma.TransportRouteWhereInput = search
    ? { OR: [{ code: search }, { name: search }, { origin: search }, { destination: search }] }
    : {};
  const [total, rows] = await Promise.all([
    prisma.transportRoute.count({ where }),
    prisma.transportRoute.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
  ]);
  return paginated(rows.map(toRoute), total, params);
}

export async function listFares(params: QueryParams = {}) {
  const { skip, take } = pageWindow(params);
  const search = contains(params.search);
  const where: Prisma.FareWhereInput = search ? { OR: [{ name: search }, { routeName: search }] } : {};
  const [total, rows] = await Promise.all([
    prisma.fare.count({ where }),
    prisma.fare.findMany({ where, orderBy: { createdAt: "desc" }, skip, take }),
  ]);
  return paginated(rows.map(toFare), total, params);
}

export async function setFareStatus(id: string, status: EntityStatus) {
  const fare = await prisma.fare.findUnique({ where: { id } });
  if (!fare) throw new HttpError(404, "Fare not found.");
  return toFare(await prisma.fare.update({ where: { id }, data: { status, updatedAt: new Date() } }));
}

export async function listPassengers(params: QueryParams = {}) {
  const { skip, take } = pageWindow(params);
  const search = contains(params.search);
  const status = params.filters?.status as AccountStatus | undefined;
  const facility = params.filters?.facility;
  const createdAt = dateRange(params);
  const where: Prisma.PassengerWhereInput = {
    ...(status ? { status } : {}),
    ...(facility ? { facility } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(search
      ? {
          OR: [{ name: search }, { email: search }, { staffNumber: search }, { facility: search }, { phone: search }],
        }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.passenger.count({ where }),
    prisma.passenger.findMany({
      where,
      include: { account: true, qrAccounts: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);
  return paginated(
    rows.map((row) => {
      const qr = row.qrAccounts.find((item) => item.status === "active") ?? row.qrAccounts[0];
      return toPassenger(row, row.account?.id, qr?.id, row.account ? Number(row.account.balance) : 0);
    }),
    total,
    params,
  );
}

export async function getPassenger(id: string) {
  const passenger = await prisma.passenger.findUnique({
    where: { id },
    include: { account: true, qrAccounts: true },
  });
  if (!passenger?.account) throw new HttpError(404, "Staff account not found.");
  const [tripCount, spent, recharged, lastTrip] = await Promise.all([
    prisma.trip.count({ where: { passengerId: id, status: "completed" } }),
    prisma.ledgerTransaction.aggregate({
      where: { passengerId: id, type: "fare", status: "successful" },
      _sum: { amount: true },
    }),
    prisma.ledgerTransaction.aggregate({
      where: { passengerId: id, type: "recharge", status: "successful" },
      _sum: { amount: true },
    }),
    prisma.trip.findFirst({
      where: { passengerId: id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    }),
  ]);
  return toPassengerDetail(passenger, passenger.account, passenger.qrAccounts, {
    totalTrips: tripCount,
    totalSpent: Math.abs(Number(spent._sum.amount ?? 0)),
    totalRecharged: Number(recharged._sum.amount ?? 0),
    lastTripAt: lastTrip?.createdAt.toISOString(),
  });
}

export async function setPassengerStatus(id: string, status: AccountStatus) {
  const passenger = await prisma.passenger.findUnique({ where: { id } });
  if (!passenger) throw new HttpError(404, "Staff account not found.");
  await prisma.$transaction([
    prisma.passenger.update({ where: { id }, data: { status } }),
    prisma.transportAccount.updateMany({
      where: { passengerId: id },
      data: { status },
    }),
  ]);
  return { success: true, message: `Account ${status}.` };
}

export async function getReports(params: QueryParams = {}): Promise<ReportBundle> {
  const createdAt = dateRange(params);
  const tripWhere = { ...(createdAt ? { createdAt } : {}), status: "completed" as const };
  const txnWhere = createdAt ? { createdAt } : {};
  const [scopedTrips, scopedTxn, routes, conductors] = await Promise.all([
    prisma.trip.findMany({ where: tripWhere }),
    prisma.ledgerTransaction.findMany({ where: txnWhere }),
    prisma.transportRoute.findMany(),
    prisma.conductor.findMany(),
  ]);
  const recharges = scopedTxn.filter((row) => row.type === "recharge" && row.status === "successful");
  const totalRevenue = scopedTrips.reduce((sum, row) => sum + Number(row.fare), 0);
  return {
    summary: {
      totalRevenue,
      totalTrips: scopedTrips.length,
      totalRecharges: recharges.length,
      rechargeValue: recharges.reduce((sum, row) => sum + Number(row.amount), 0),
      failedTransactions: scopedTxn.filter((row) => row.status === "failed").length,
      averageFare: scopedTrips.length ? totalRevenue / scopedTrips.length : 0,
    },
    daily: [],
    weekly: [],
    monthly: [],
    byRoute: routes.map((route) => {
      const routeTrips = scopedTrips.filter((row) => row.routeId === route.id);
      const revenue = routeTrips.reduce((sum, row) => sum + Number(row.fare), 0);
      return {
        routeId: route.id,
        routeName: route.name,
        trips: routeTrips.length,
        revenue,
        averageFare: routeTrips.length ? revenue / routeTrips.length : 0,
      };
    }),
    recharges: [],
    conductors: conductors.map((row) => ({
      conductorId: row.id,
      conductorName: row.name,
      staffNumber: row.staffNumber,
      trips: scopedTrips.filter((trip) => trip.conductorId === row.id).length,
      revenue: scopedTrips
        .filter((trip) => trip.conductorId === row.id)
        .reduce((sum, trip) => sum + Number(trip.fare), 0),
      lastActiveAt: row.lastActiveAt?.toISOString(),
    })),
    failedTransactions: scopedTxn.filter((row) => row.status === "failed").map(toTransaction),
  };
}
