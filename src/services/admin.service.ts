import { appConfig } from "@/config/app";
import {
  accounts,
  buses,
  conductors,
  fares,
  inDateRange,
  matchesSearch,
  newId,
  paginate,
  passengers,
  qrAccounts,
  routes,
  transactions,
  trips,
} from "@/data/store";
import { toQuery } from "@/lib/query";
import { apiRequest, mockLatency, useLiveApi } from "@/services/api";
import type {
  AdminDashboardData,
  Bus,
  Conductor,
  Fare,
  Paginated,
  QueryParams,
  ReportBundle,
  TimeSeriesPoint,
  TransportRoute,
} from "@/types";

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  if (useLiveApi()) return apiRequest("/admin/dashboard");
  await mockLatency();

  const today = "2026-09-03";
  const tripsToday = trips.filter((row) => row.createdAt.startsWith(today));
  const revenueToday = tripsToday
    .filter((row) => row.status === "completed")
    .reduce((sum, row) => sum + row.fare, 0);
  const failedToday = transactions.filter(
    (row) => row.createdAt.startsWith(today) && row.status === "failed",
  );

  const series: TimeSeriesPoint[] = Array.from({ length: 7 }, (_, index) => {
    const date = new Date("2026-09-03T00:00:00.000Z");
    date.setUTCDate(date.getUTCDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    const dayTrips = trips.filter((row) => row.createdAt.startsWith(key) && row.status === "completed");
    return {
      label: date.toLocaleDateString("en-SL", { weekday: "short", timeZone: "UTC" }),
      date: key,
      trips: dayTrips.length || (index === 6 ? 3 : index + 1),
      revenue: dayTrips.reduce((sum, row) => sum + row.fare, 0) || (index + 2) * 18,
    };
  });

  return {
    stats: {
      totalPassengers: passengers.length,
      passengerGrowthPercent: 4.2,
      activeQrAccounts: qrAccounts.filter((row) => row.status === "active").length,
      qrGrowthPercent: 1.8,
      tripsToday: tripsToday.length,
      tripsGrowthPercent: 6.4,
      revenueToday,
      revenueGrowthPercent: 3.1,
      walletFloat: accounts.reduce((sum, row) => sum + row.balance, 0),
      failedTransactionsToday: failedToday.length,
      lowBalanceAccounts: accounts.filter((row) => row.balance <= appConfig.lowBalanceThreshold && row.status === "active").length,
      activeConductors: conductors.filter((row) => row.status === "active").length,
    },
    series,
    transactionMix: [
      { type: "Fare", value: transactions.filter((row) => row.type === "fare").length },
      { type: "Recharge", value: transactions.filter((row) => row.type === "recharge").length },
      { type: "Refund", value: transactions.filter((row) => row.type === "refund").length },
      { type: "Adjustment", value: transactions.filter((row) => row.type === "adjustment").length },
    ],
    recentTransactions: transactions.slice(0, 5),
    recentTrips: trips.slice(0, 5),
    failedTransactions: transactions.filter((row) => row.status === "failed").slice(0, 5),
    lowBalanceAccounts: accounts
      .filter((row) => row.balance <= appConfig.lowBalanceThreshold)
      .map((row) => {
        const staff = passengers.find((p) => p.id === row.passengerId);
        return {
          accountId: row.id,
          passengerId: row.passengerId,
          passengerName: staff?.name ?? "Unknown",
          accountNumber: row.accountNumber,
          balance: row.balance,
        };
      }),
  };
}

export async function listConductors(params: QueryParams = {}): Promise<Paginated<Conductor>> {
  if (useLiveApi()) return apiRequest(`/admin/conductors${toQuery(params)}`);
  await mockLatency();
  const filtered = conductors.filter((row) =>
    matchesSearch(`${row.name} ${row.staffNumber} ${row.contact}`, params.search),
  );
  return paginate(filtered, params);
}

export async function createConductor(input: Pick<Conductor, "name" | "contact" | "email" | "staffNumber">) {
  if (useLiveApi()) return apiRequest("/admin/conductors", { method: "POST", body: input });
  await mockLatency();
  const row: Conductor = {
    ...input,
    id: newId("cnd"),
    status: "active",
    tripsProcessed: 0,
    createdAt: new Date().toISOString(),
  };
  conductors.unshift(row);
  return row;
}

export async function setConductorStatus(id: string, status: Conductor["status"]) {
  if (useLiveApi()) return apiRequest(`/admin/conductors/${id}/status`, { method: "PATCH", body: { status } });
  await mockLatency();
  const row = conductors.find((item) => item.id === id);
  if (!row) throw new Error("Conductor not found.");
  row.status = status;
  return row;
}

export async function listBuses(params: QueryParams = {}): Promise<Paginated<Bus>> {
  if (useLiveApi()) return apiRequest(`/admin/buses${toQuery(params)}`);
  await mockLatency();
  const filtered = buses.filter((row) =>
    matchesSearch(`${row.busNumber} ${row.registrationNumber} ${row.routeName ?? ""}`, params.search),
  );
  return paginate(filtered, params);
}

export async function listRoutes(params: QueryParams = {}): Promise<Paginated<TransportRoute>> {
  if (useLiveApi()) return apiRequest(`/admin/routes${toQuery(params)}`);
  await mockLatency();
  const filtered = routes.filter((row) =>
    matchesSearch(`${row.code} ${row.name} ${row.origin} ${row.destination}`, params.search),
  );
  return paginate(filtered, params);
}

export async function listFares(params: QueryParams = {}): Promise<Paginated<Fare>> {
  if (useLiveApi()) return apiRequest(`/admin/fares${toQuery(params)}`);
  await mockLatency();
  const filtered = fares.filter((row) => matchesSearch(`${row.name} ${row.routeName}`, params.search));
  return paginate(filtered, params);
}

export async function setFareStatus(id: string, status: Fare["status"]) {
  if (useLiveApi()) return apiRequest(`/admin/fares/${id}/status`, { method: "PATCH", body: { status } });
  await mockLatency();
  const fare = fares.find((row) => row.id === id);
  if (!fare) throw new Error("Fare not found.");
  fare.status = status;
  fare.updatedAt = new Date().toISOString();
  return fare;
}

export async function getReports(params: QueryParams = {}): Promise<ReportBundle> {
  if (useLiveApi()) return apiRequest(`/admin/reports${toQuery(params)}`);
  await mockLatency();

  const scopedTrips = trips.filter(
    (row) => inDateRange(row.createdAt, params.from, params.to) && row.status === "completed",
  );
  const scopedTxn = transactions.filter((row) => inDateRange(row.createdAt, params.from, params.to));
  const recharges = scopedTxn.filter((row) => row.type === "recharge" && row.status === "successful");

  const byRoute = routes.map((route) => {
    const routeTrips = scopedTrips.filter((row) => row.routeId === route.id);
    const revenue = routeTrips.reduce((sum, row) => sum + row.fare, 0);
    return {
      routeId: route.id,
      routeName: route.name,
      trips: routeTrips.length,
      revenue,
      averageFare: routeTrips.length ? revenue / routeTrips.length : 0,
    };
  });

  return {
    summary: {
      totalRevenue: scopedTrips.reduce((sum, row) => sum + row.fare, 0),
      totalTrips: scopedTrips.length,
      totalRecharges: recharges.length,
      rechargeValue: recharges.reduce((sum, row) => sum + row.amount, 0),
      failedTransactions: scopedTxn.filter((row) => row.status === "failed").length,
      averageFare: scopedTrips.length
        ? scopedTrips.reduce((sum, row) => sum + row.fare, 0) / scopedTrips.length
        : 0,
    },
    daily: [],
    weekly: [],
    monthly: [],
    byRoute,
    recharges: [],
    conductors: conductors.map((row) => ({
      conductorId: row.id,
      conductorName: row.name,
      staffNumber: row.staffNumber,
      trips: scopedTrips.filter((trip) => trip.conductorId === row.id).length,
      revenue: scopedTrips.filter((trip) => trip.conductorId === row.id).reduce((sum, trip) => sum + trip.fare, 0),
      lastActiveAt: row.lastActiveAt,
    })),
    failedTransactions: scopedTxn.filter((row) => row.status === "failed"),
  };
}
