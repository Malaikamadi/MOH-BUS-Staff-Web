import type { ID } from "./common";

export type ScanFailureCode =
  | "INVALID_QR"
  | "QR_DISABLED"
  | "QR_REPLACED"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_INACTIVE"
  | "INSUFFICIENT_BALANCE"
  | "ROUTE_UNAVAILABLE"
  | "CONDUCTOR_INACTIVE"
  | "UNAUTHORISED";

export interface ScanRequest {
  /** Prefixed payload from the QR, or the raw `qrt_` token. */
  payload: string;
  busId?: ID;
  routeId?: ID;
  boardingStop?: string;
}

export interface ScanTraveller {
  displayName: string;
  staffNumber: string;
  facility: string;
}

export interface ScanSuccess {
  ok: true;
  code: "FARE_DEDUCTED";
  message: string;
  trip: {
    id: ID;
    reference: string;
    fare: number;
    routeName: string;
    busNumber: string;
    createdAt: string;
  };
  traveller: ScanTraveller;
  wallet: {
    balanceAfter: number;
  };
}

export interface ScanFailure {
  ok: false;
  code: ScanFailureCode;
  message: string;
  fare?: number;
  balance?: number;
}

export type ScanResult = ScanSuccess | ScanFailure;

export interface ConductorSession {
  accessToken: string;
  expiresAt: string;
  conductor: {
    id: ID;
    name: string;
    staffNumber: string;
    busId?: ID;
    busNumber?: string;
    routeId?: ID;
    routeName?: string;
    fare: number;
  };
}

export interface ConductorLoginRequest {
  staffNumber: string;
  password: string;
}
