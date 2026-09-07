import type { AccountStatus, ID, ISODateString } from "./common";
import type { User } from "./user";

export interface Passenger {
  id: ID;
  userId: ID;
  accountId: ID;
  qrId: ID;
  /** Convenience fields denormalised by the API for list views. */
  name: string;
  email: string;
  phone: string;
  /** Ministry staff number, e.g. `MOH-SL-004182`. */
  staffNumber: string;
  designation: string;
  facility: string;
  status: AccountStatus;
  createdAt: ISODateString;
  /** Denormalised wallet balance for admin list views. */
  walletBalance?: number;
}

export interface TransportAccount {
  id: ID;
  passengerId: ID;
  /** Human-readable account number shown in the UI (not a secret). */
  accountNumber: string;
  balance: number;
  status: AccountStatus;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type QRStatus = "active" | "disabled" | "replaced";

export interface QRAccount {
  id: ID;
  accountId: ID;
  /**
   * Opaque, backend-issued token. Contains no identity or balance data —
   * it is only a lookup key for the conductor scan endpoint.
   */
  secureToken: string;
  status: QRStatus;
  createdAt: ISODateString;
  /** Set when this QR was superseded by a replacement. */
  revokedAt?: ISODateString;
  replacedByQrId?: ID;
  /** Denormalised for admin list views. */
  passengerId: ID;
  passengerName: string;
  lastScannedAt?: ISODateString;
  scanCount: number;
}

/** Identity details, only ever loaded on screens that need them. */
export interface PassengerIdentity {
  /** Masked by the API for display, e.g. `*******1234`. */
  ninMasked: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  emergencyContact?: string;
}

/** Aggregate returned by the passenger detail endpoint. */
export interface PassengerDetail {
  passenger: Passenger;
  account: TransportAccount;
  qr: QRAccount;
  identity: PassengerIdentity;
  stats: {
    totalTrips: number;
    totalSpent: number;
    totalRecharged: number;
    lastTripAt?: ISODateString;
  };
}

export interface StaffProfile {
  user: User;
  passenger: Passenger;
  account: TransportAccount;
  qr: QRAccount;
  identity: PassengerIdentity;
}
