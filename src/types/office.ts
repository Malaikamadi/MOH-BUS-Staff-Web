import type { AccountStatus, ID } from "./common";
import type { Passenger, QRStatus, TransportAccount } from "./passenger";
import type { Transaction } from "./transaction";
import type { User } from "./user";

export interface OfficeStaffMatch {
  passenger: Passenger;
  account: TransportAccount;
  qrStatus: QRStatus;
  ninMasked: string;
}

export interface OfficeDashboard {
  desk: string;
  stats: {
    rechargesToday: number;
    valueToday: number;
    staffHelpedToday: number;
  };
  recent: Transaction[];
}

export interface SuperAdminDashboard {
  stats: {
    totalUsers: number;
    superAdmins: number;
    admins: number;
    officers: number;
    staff: number;
    walletFloat: number;
    officeRechargesToday: number;
    officeValueToday: number;
  };
  operators: User[];
  recentOfficeRecharges: Transaction[];
}

export interface OperatorStatusUpdate {
  status: AccountStatus;
}

export interface OfficeRechargeRequest {
  accountId: ID;
  amount: number;
  method: "agent" | "mobile_money" | "bank_transfer";
  note?: string;
}
