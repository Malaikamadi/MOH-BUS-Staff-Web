import { prisma } from "@/lib/db";
import { newId, newReference, newSessionToken } from "@/lib/ids";
import { toConductor } from "@/lib/mappers";
import { verifyPassword } from "@/lib/password";
import { decodeQrPayload } from "@/lib/qr-payload";
import { HttpError } from "@/server/errors";
import type { Conductor, ConductorLoginRequest, ConductorSession, ScanRequest, ScanResult } from "@/types";

const SESSION_MS = 12 * 60 * 60 * 1000;

function money(value: { toNumber(): number } | number) {
  return typeof value === "number" ? value : value.toNumber();
}

async function assignment(conductor: Conductor): Promise<ConductorSession["conductor"]> {
  const bus = conductor.busId
    ? await prisma.bus.findUnique({ where: { id: conductor.busId } })
    : null;
  const route = bus?.routeId
    ? await prisma.transportRoute.findUnique({ where: { id: bus.routeId } })
    : null;
  const fare = route
    ? await prisma.fare.findFirst({
        where: { routeId: route.id, status: "active" },
        orderBy: { updatedAt: "desc" },
      })
    : null;

  return {
    id: conductor.id,
    name: conductor.name,
    staffNumber: conductor.staffNumber,
    busId: bus?.id,
    busNumber: bus?.busNumber ?? conductor.busNumber,
    routeId: route?.id ?? bus?.routeId ?? undefined,
    routeName: route?.name ?? bus?.routeName ?? undefined,
    fare: fare ? money(fare.amount) : route ? money(route.fare) : 0,
  };
}

export async function loginConductor(request: ConductorLoginRequest): Promise<ConductorSession> {
  const staffNumber = request.staffNumber.trim().toUpperCase();
  const conductor = await prisma.conductor.findUnique({ where: { staffNumber } });
  if (!conductor || !(await verifyPassword(request.password, conductor.passwordHash))) {
    throw new HttpError(401, "Staff number or password is incorrect.", "UNAUTHORISED");
  }
  if (conductor.status !== "active") {
    throw new HttpError(403, "This conductor account is not active.", "CONDUCTOR_INACTIVE");
  }

  const now = new Date();
  const expiresAt = new Date(Date.now() + SESSION_MS);
  const accessToken = newSessionToken("cnd", conductor.id);

  await prisma.$transaction([
    prisma.conductor.update({ where: { id: conductor.id }, data: { lastActiveAt: now } }),
    prisma.conductorSession.create({
      data: { token: accessToken, conductorId: conductor.id, expiresAt },
    }),
  ]);

  return {
    accessToken,
    expiresAt: expiresAt.toISOString(),
    conductor: await assignment(toConductor({ ...conductor, lastActiveAt: now })),
  };
}

export async function conductorFromToken(token: string | null): Promise<Conductor | null> {
  if (!token) return null;
  const session = await prisma.conductorSession.findUnique({
    where: { token },
    include: { conductor: true },
  });
  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) {
      await prisma.conductorSession.delete({ where: { id: session.id } }).catch(() => undefined);
    }
    return null;
  }
  return toConductor(session.conductor);
}

export async function getConductorContext(conductor: Conductor) {
  return assignment(conductor);
}

export async function processScan(conductor: Conductor, request: ScanRequest): Promise<ScanResult> {
  if (conductor.status !== "active") {
    return { ok: false, code: "CONDUCTOR_INACTIVE", message: "This conductor account is not active." };
  }

  const token = decodeQrPayload(request.payload);
  if (!token) {
    return { ok: false, code: "INVALID_QR", message: "This is not a Ministry of Health transport QR." };
  }

  const qr = await prisma.qrAccount.findUnique({
    where: { secureToken: token },
    include: { passenger: true, account: true },
  });
  if (!qr) {
    return { ok: false, code: "INVALID_QR", message: "This QR code is not recognised." };
  }
  if (qr.status === "disabled") {
    return {
      ok: false,
      code: "QR_DISABLED",
      message: "This QR code has been disabled. Ask the staff member to use a replacement.",
    };
  }
  if (qr.status === "replaced") {
    return {
      ok: false,
      code: "QR_REPLACED",
      message: "This QR code has been replaced. Ask the staff member to present the new code.",
    };
  }

  const { passenger, account } = qr;
  if (passenger.status === "suspended" || account.status === "suspended") {
    return { ok: false, code: "ACCOUNT_SUSPENDED", message: "This staff account is suspended and cannot board." };
  }
  if (passenger.status !== "active" || account.status !== "active") {
    return { ok: false, code: "ACCOUNT_INACTIVE", message: "This staff account is not active." };
  }

  const busId = request.busId ?? conductor.busId;
  const bus = busId ? await prisma.bus.findUnique({ where: { id: busId } }) : null;
  const routeId = request.routeId ?? bus?.routeId;
  const route = routeId ? await prisma.transportRoute.findUnique({ where: { id: routeId } }) : null;
  if (!bus || !route || route.status !== "active" || bus.status !== "active") {
    return { ok: false, code: "ROUTE_UNAVAILABLE", message: "No active route is assigned to this bus." };
  }

  const published = await prisma.fare.findFirst({
    where: { routeId: route.id, status: "active" },
    orderBy: { updatedAt: "desc" },
  });
  const fare = published ? money(published.amount) : money(route.fare);
  const now = new Date();
  const tripId = newId("trp");
  const tripRef = newReference("TRP");
  const txnRef = newReference("TXN");
  const boardingStop = request.boardingStop ?? route.origin;

  if (money(account.balance) < fare) {
    await prisma.$transaction([
      prisma.trip.create({
        data: {
          id: tripId,
          reference: tripRef,
          passengerId: passenger.id,
          passengerName: passenger.name,
          accountId: account.id,
          qrId: qr.id,
          busId: bus.id,
          busNumber: bus.busNumber,
          conductorId: conductor.id,
          conductorName: conductor.name,
          routeId: route.id,
          routeName: route.name,
          boardingStop,
          destinationStop: route.destination,
          fare,
          status: "failed",
          failureReason: "Insufficient wallet balance",
          createdAt: now,
        },
      }),
      prisma.ledgerTransaction.create({
        data: {
          id: newId("txn"),
          reference: txnRef,
          accountId: account.id,
          passengerId: passenger.id,
          passengerName: passenger.name,
          type: "fare",
          description: `Staff fare · ${route.code} ${route.origin} — ${route.destination}`,
          amount: -fare,
          balanceAfter: account.balance,
          status: "failed",
          failureReason: "Insufficient wallet balance",
          createdAt: now,
        },
      }),
    ]);
    return {
      ok: false,
      code: "INSUFFICIENT_BALANCE",
      message: "Insufficient wallet balance for this fare.",
      fare,
      balance: money(account.balance),
    };
  }

  const deducted = await prisma.$transaction(async (tx) => {
    const updated = await tx.transportAccount.updateMany({
      where: { id: account.id, status: "active", balance: { gte: fare } },
      data: { balance: { decrement: fare }, updatedAt: now },
    });
    if (updated.count !== 1) return null;

    const wallet = await tx.transportAccount.findUniqueOrThrow({ where: { id: account.id } });
    await tx.qrAccount.update({
      where: { id: qr.id },
      data: { lastScannedAt: now, scanCount: { increment: 1 } },
    });
    await tx.conductor.update({
      where: { id: conductor.id },
      data: { tripsProcessed: { increment: 1 }, lastActiveAt: now },
    });
    await tx.trip.create({
      data: {
        id: tripId,
        reference: tripRef,
        passengerId: passenger.id,
        passengerName: passenger.name,
        accountId: account.id,
        qrId: qr.id,
        busId: bus.id,
        busNumber: bus.busNumber,
        conductorId: conductor.id,
        conductorName: conductor.name,
        routeId: route.id,
        routeName: route.name,
        boardingStop,
        destinationStop: route.destination,
        fare,
        status: "completed",
        createdAt: now,
      },
    });
    await tx.ledgerTransaction.create({
      data: {
        id: newId("txn"),
        reference: txnRef,
        accountId: account.id,
        passengerId: passenger.id,
        passengerName: passenger.name,
        type: "fare",
        description: `Staff fare · ${route.code} ${route.origin} — ${route.destination}`,
        amount: -fare,
        balanceAfter: wallet.balance,
        status: "successful",
        tripId,
        createdAt: now,
      },
    });
    return money(wallet.balance);
  });

  if (deducted === null) {
    return {
      ok: false,
      code: "INSUFFICIENT_BALANCE",
      message: "Insufficient wallet balance for this fare.",
      fare,
      balance: money(account.balance),
    };
  }

  return {
    ok: true,
    code: "FARE_DEDUCTED",
    message: "Fare deducted. Staff may board.",
    trip: {
      id: tripId,
      reference: tripRef,
      fare,
      routeName: route.name,
      busNumber: bus.busNumber,
      createdAt: now.toISOString(),
    },
    traveller: {
      displayName: passenger.name,
      staffNumber: passenger.staffNumber,
      facility: passenger.facility,
    },
    wallet: { balanceAfter: deducted },
  };
}
