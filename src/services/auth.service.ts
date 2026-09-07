import { appConfig } from "@/config/app";
import { demoCredentials } from "@/data/demo";
import {
  accounts,
  identities,
  issueSession,
  newId,
  newToken,
  passengers,
  qrAccounts,
  users,
} from "@/data/store";
import { apiRequest, mockLatency, useLiveApi } from "@/services/api";
import type {
  AuthSession,
  LoginCredentials,
  PasswordResetPayload,
  PasswordResetRequest,
  RegistrationPayload,
  User,
} from "@/types";

const SESSION_COOKIE = appConfig.session.cookieName;

export function persistSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(appConfig.session.storageKey, JSON.stringify(session));
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(
    JSON.stringify({ role: session.user.role, exp: session.expiresAt }),
  )}; Path=/; SameSite=Lax; Max-Age=${8 * 60 * 60}`;
}

export function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(appConfig.session.storageKey);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as AuthSession;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    clearSession();
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(appConfig.session.storageKey);
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  if (useLiveApi()) {
    const session = await apiRequest<AuthSession>("/auth/login", {
      method: "POST",
      body: credentials,
    });
    persistSession(session);
    return session;
  }

  await mockLatency();
  const email = credentials.email.trim().toLowerCase();
  const isAdmin =
    email === demoCredentials.admin.email && credentials.password === demoCredentials.admin.password;
  const isStaff =
    email === demoCredentials.staff.email && credentials.password === demoCredentials.staff.password;

  const user = users.find((row) => row.email.toLowerCase() === email);
  if (!user || (!isAdmin && !isStaff && credentials.password !== "Password123")) {
    throw new Error("The email or password is incorrect.");
  }
  if (user.status === "suspended") {
    throw new Error("This account has been suspended. Contact your facility transport office.");
  }

  const session = issueSession(user);
  persistSession(session);
  return session;
}

export async function register(payload: RegistrationPayload): Promise<AuthSession> {
  if (useLiveApi()) {
    const session = await apiRequest<AuthSession>("/auth/register", {
      method: "POST",
      body: payload,
    });
    persistSession(session);
    return session;
  }

  await mockLatency(420);
  if (users.some((row) => row.email.toLowerCase() === payload.email.trim().toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }

  const userId = newId("usr");
  const passengerId = newId("psg");
  const accountId = newId("acc");
  const qrId = newId("qr");
  const now = new Date().toISOString();

  const user: User = {
    id: userId,
    name: payload.fullName,
    email: payload.email.trim(),
    phone: payload.phone,
    role: "passenger",
    status: "active",
    createdAt: now,
  };

  users.push(user);
  passengers.push({
    id: passengerId,
    userId,
    accountId,
    qrId,
    name: payload.fullName,
    email: payload.email.trim(),
    phone: payload.phone,
    staffNumber: payload.staffNumber,
    designation: payload.designation,
    facility: payload.facility,
    status: "active",
    createdAt: now,
  });
  accounts.push({
    id: accountId,
    passengerId,
    accountNumber: `ACC-SL-${payload.staffNumber.replace(/\D/g, "").slice(-6) || "000000"}`,
    balance: 0,
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  qrAccounts.push({
    id: qrId,
    accountId,
    secureToken: newToken(),
    status: "active",
    createdAt: now,
    passengerId,
    passengerName: payload.fullName,
    scanCount: 0,
  });
  identities[passengerId] = {
    ninMasked: `${"•".repeat(8)}${payload.nin.replace(/\D/g, "").slice(-4)}`,
  };

  const session = issueSession(user);
  persistSession(session);
  return session;
}

export async function requestPasswordReset(payload: PasswordResetRequest) {
  if (useLiveApi()) {
    return apiRequest<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: payload,
    });
  }
  await mockLatency();
  return {
    message: `If an account exists for ${payload.email}, a reset link has been sent.`,
  };
}

export async function resetPassword(payload: PasswordResetPayload) {
  if (useLiveApi()) {
    return apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: payload,
    });
  }
  await mockLatency();
  if (!payload.token || payload.password.length < 8) {
    throw new Error("The reset link is invalid or the password is too short.");
  }
  return { message: "Your password has been updated. You can now log in." };
}

export async function logout() {
  if (useLiveApi()) {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch {
      /* still clear the local session */
    }
  }
  clearSession();
}
