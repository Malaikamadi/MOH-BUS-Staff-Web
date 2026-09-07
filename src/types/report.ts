import type { ID } from "./common";
import type { Transaction } from "./transaction";
import type { Trip } from "./trip";

export interface AdminDashboardStats {
  totalPassengers: number;
  passengerGrowthPercent: number;
  activeQrAccounts: number;
  qrGrowthPercent: number;
  tripsToday: number;
  tripsGrowthPercent: number;
  revenueToday: number;
  revenueGrowthPercent: number;
  walletFloat: number;
  failedTransactionsToday: number;
  lowBalanceAccounts: number;
  activeConductors: number;
}

export interface TimeSeriesPoint {
  /** Pre-formatted, timezone-stable label produced by the service layer. */
  label: string;
  date: string;
  revenue: number;
  trips: number;
}

export interface LowBalanceAccount {
  accountId: ID;
  passengerId: ID;
  passengerName: string;
  accountNumber: string;
  balance: number;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  series: TimeSeriesPoint[];
  transactionMix: { type: string; value: number }[];
  recentTransactions: Transaction[];
  recentTrips: Trip[];
  failedTransactions: Transaction[];
  lowBalanceAccounts: LowBalanceAccount[];
}

export interface RevenueSummary {
  totalRevenue: number;
  totalTrips: number;
  totalRecharges: number;
  rechargeValue: number;
  failedTransactions: number;
  averageFare: number;
}

export interface RouteRevenueRow {
  routeId: ID;
  routeName: string;
  trips: number;
  revenue: number;
  averageFare: number;
}

export interface ConductorActivityRow {
  conductorId: ID;
  conductorName: string;
  staffNumber: string;
  trips: number;
  revenue: number;
  lastActiveAt?: string;
}

export interface RechargeActivityRow {
  date: string;
  label: string;
  count: number;
  value: number;
  failed: number;
}

export interface ReportBundle {
  summary: RevenueSummary;
  daily: TimeSeriesPoint[];
  weekly: TimeSeriesPoint[];
  monthly: TimeSeriesPoint[];
  byRoute: RouteRevenueRow[];
  recharges: RechargeActivityRow[];
  conductors: ConductorActivityRow[];
  failedTransactions: Transaction[];
}

export interface PassengerDashboardData {
  balance: number;
  accountNumber: string;
  accountStatus: string;
  qrStatus: string;
  tripsThisMonth: number;
  spentThisMonth: number;
  recentTransactions: Transaction[];
  recentTrips: Trip[];
}
