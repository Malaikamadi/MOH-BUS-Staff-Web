import type { AccountStatus, ID, ISODateString } from "./common";

export type UserRole = "passenger" | "admin" | "super_admin" | "officer";

export interface OperatorDraft {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Extract<UserRole, "admin" | "officer">;
}

export interface User {
  id: ID;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: ISODateString;
}

/** Authenticated session as returned by the auth endpoints. */
export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken?: string;
  /** Absolute expiry so the client can detect an expired session locally. */
  expiresAt: ISODateString;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegistrationPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  staffNumber: string;
  designation: string;
  facility: string;
  /** National identity number — collected but never surfaced in QR payloads. */
  nin: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetPayload {
  token: string;
  password: string;
}
