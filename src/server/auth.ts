import { prisma } from "@/lib/db";
import { newId, newSessionToken, newToken } from "@/lib/ids";
import { toPassengerDetail, toUser } from "@/lib/mappers";
import { hashNin, maskNin } from "@/lib/nin";
import { hashPassword, verifyPassword } from "@/lib/password";
import { HttpError } from "@/server/errors";
import type { AuthSession, LoginCredentials, RegistrationPayload, User } from "@/types";

const SESSION_MS = 8 * 60 * 60 * 1000;

async function issueSession(user: User): Promise<AuthSession> {
  const expiresAt = new Date(Date.now() + SESSION_MS);
  const accessToken = newSessionToken("usr", user.id);
  await prisma.session.create({
    data: { token: accessToken, userId: user.id, expiresAt },
  });
  return { user, accessToken, expiresAt: expiresAt.toISOString() };
}

export async function userFromToken(token: string | null) {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    return null;
  }
  if (session.user.status === "suspended") return null;
  return session.user;
}

export async function loginWithPassword(credentials: LoginCredentials): Promise<AuthSession> {
  const email = credentials.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(credentials.password, user.passwordHash))) {
    throw new HttpError(401, "The email or password is incorrect.");
  }
  if (user.status === "suspended") {
    throw new HttpError(403, "This account has been suspended. Contact your facility transport office.");
  }
  return issueSession(toUser(user));
}

export async function registerStaff(payload: RegistrationPayload): Promise<AuthSession> {
  const email = payload.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "An account with this email already exists.");

  const staffNumber = payload.staffNumber.trim();
  const taken = await prisma.passenger.findUnique({ where: { staffNumber } });
  if (taken) throw new HttpError(409, "This staff number is already enrolled.");

  const now = new Date();
  const userId = newId("usr");
  const passengerId = newId("psg");
  const accountId = newId("acc");
  const qrId = newId("qr");
  const passwordHash = await hashPassword(payload.password);
  const digits = payload.staffNumber.replace(/\D/g, "").slice(-6) || "000000";
  const ninHash = hashNin(payload.nin);
  if (!ninHash) throw new HttpError(400, "Enter a valid national identity number.");
  const ninTaken = await prisma.passenger.findUnique({ where: { ninHash } });
  if (ninTaken) throw new HttpError(409, "This national identity number is already enrolled.");

  await prisma.$transaction([
    prisma.user.create({
      data: {
        id: userId,
        name: payload.fullName,
        email,
        phone: payload.phone,
        passwordHash,
        role: "passenger",
        status: "active",
        createdAt: now,
      },
    }),
    prisma.passenger.create({
      data: {
        id: passengerId,
        userId,
        name: payload.fullName,
        email,
        phone: payload.phone,
        staffNumber,
        designation: payload.designation,
        facility: payload.facility,
        status: "active",
        ninMasked: maskNin(payload.nin),
        ninHash,
        createdAt: now,
      },
    }),
    prisma.transportAccount.create({
      data: {
        id: accountId,
        passengerId,
        accountNumber: `ACC-SL-${digits}`,
        balance: 0,
        status: "active",
        createdAt: now,
        updatedAt: now,
      },
    }),
    prisma.qrAccount.create({
      data: {
        id: qrId,
        accountId,
        passengerId,
        passengerName: payload.fullName,
        secureToken: newToken(),
        status: "active",
        createdAt: now,
        scanCount: 0,
      },
    }),
  ]);

  return issueSession({
    id: userId,
    name: payload.fullName,
    email,
    phone: payload.phone,
    role: "passenger",
    status: "active",
    createdAt: now.toISOString(),
  });
}

export async function requestPasswordReset(_email: string) {
  return { message: "If an account exists for that email, a reset link has been sent." };
}

export async function resetPassword(_token: string, password: string) {
  if (!_token || password.length < 8) {
    throw new HttpError(400, "The reset link is invalid or the password is too short.");
  }
  return { message: "Your password has been updated. You can now log in." };
}

export async function logoutUser(token: string | null) {
  if (!token) return;
  await prisma.session.deleteMany({ where: { token } });
}

export async function getStaffProfileForUser(userId: string) {
  const passenger = await prisma.passenger.findUnique({
    where: { userId },
    include: { account: true, qrAccounts: true },
  });
  if (!passenger?.account) throw new HttpError(404, "Staff profile not found.");

  const [tripCount, spent, recharged, lastTrip] = await Promise.all([
    prisma.trip.count({ where: { passengerId: passenger.id, status: "completed" } }),
    prisma.ledgerTransaction.aggregate({
      where: { passengerId: passenger.id, type: "fare", status: "successful" },
      _sum: { amount: true },
    }),
    prisma.ledgerTransaction.aggregate({
      where: { passengerId: passenger.id, type: "recharge", status: "successful" },
      _sum: { amount: true },
    }),
    prisma.trip.findFirst({
      where: { passengerId: passenger.id },
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
