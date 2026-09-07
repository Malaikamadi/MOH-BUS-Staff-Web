import type {
  Bus,
  Conductor,
  Fare,
  Passenger,
  PassengerDetail,
  QRAccount,
  RouteStop,
  Transaction,
  TransportAccount,
  TransportRoute,
  Trip,
  User,
} from "@/types";
import type {
  Bus as DbBus,
  Conductor as DbConductor,
  Fare as DbFare,
  LedgerTransaction as DbTransaction,
  Passenger as DbPassenger,
  QrAccount as DbQr,
  TransportAccount as DbAccount,
  TransportRoute as DbRoute,
  Trip as DbTrip,
  User as DbUser,
} from "@prisma/client";

function money(value: { toNumber(): number } | number | string) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber();
}

function iso(value: Date) {
  return value.toISOString();
}

export function toUser(row: DbUser): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    status: row.status,
    createdAt: iso(row.createdAt),
  };
}

export function toPassenger(
  row: DbPassenger,
  accountId?: string,
  qrId?: string,
  walletBalance?: number,
): Passenger {
  return {
    id: row.id,
    userId: row.userId,
    accountId: accountId ?? "",
    qrId: qrId ?? "",
    name: row.name,
    email: row.email,
    phone: row.phone,
    staffNumber: row.staffNumber,
    designation: row.designation,
    facility: row.facility,
    status: row.status,
    createdAt: iso(row.createdAt),
    walletBalance,
  };
}

export function toAccount(row: DbAccount): TransportAccount {
  return {
    id: row.id,
    passengerId: row.passengerId,
    accountNumber: row.accountNumber,
    balance: money(row.balance),
    status: row.status,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function toQr(row: DbQr): QRAccount {
  return {
    id: row.id,
    accountId: row.accountId,
    secureToken: row.secureToken,
    status: row.status,
    createdAt: iso(row.createdAt),
    revokedAt: row.revokedAt ? iso(row.revokedAt) : undefined,
    replacedByQrId: row.replacedByQrId ?? undefined,
    passengerId: row.passengerId,
    passengerName: row.passengerName,
    lastScannedAt: row.lastScannedAt ? iso(row.lastScannedAt) : undefined,
    scanCount: row.scanCount,
  };
}

export function toRoute(row: DbRoute): TransportRoute {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    origin: row.origin,
    destination: row.destination,
    stops: (row.stops as unknown as RouteStop[]) ?? [],
    distanceKm: money(row.distanceKm),
    fare: money(row.fare),
    status: row.status,
    createdAt: iso(row.createdAt),
  };
}

export function toFare(row: DbFare): Fare {
  return {
    id: row.id,
    name: row.name,
    routeId: row.routeId,
    routeName: row.routeName,
    category: row.category,
    amount: money(row.amount),
    status: row.status,
    effectiveFrom: iso(row.effectiveFrom),
    effectiveTo: row.effectiveTo ? iso(row.effectiveTo) : undefined,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
}

export function toConductor(row: DbConductor): Conductor {
  return {
    id: row.id,
    staffNumber: row.staffNumber,
    name: row.name,
    contact: row.contact,
    email: row.email ?? undefined,
    busId: row.busId ?? undefined,
    busNumber: row.busNumber ?? undefined,
    status: row.status,
    tripsProcessed: row.tripsProcessed,
    lastActiveAt: row.lastActiveAt ? iso(row.lastActiveAt) : undefined,
    createdAt: iso(row.createdAt),
  };
}

export function toBus(row: DbBus): Bus {
  return {
    id: row.id,
    busNumber: row.busNumber,
    registrationNumber: row.registrationNumber,
    routeId: row.routeId ?? undefined,
    routeName: row.routeName ?? undefined,
    conductorId: row.conductorId ?? undefined,
    conductorName: row.conductorName ?? undefined,
    capacity: row.capacity,
    status: row.status,
    createdAt: iso(row.createdAt),
  };
}

export function toTransaction(row: DbTransaction): Transaction {
  return {
    id: row.id,
    reference: row.reference,
    accountId: row.accountId,
    passengerId: row.passengerId,
    passengerName: row.passengerName,
    type: row.type,
    description: row.description,
    amount: money(row.amount),
    balanceAfter: money(row.balanceAfter),
    status: row.status,
    method: row.method ?? undefined,
    tripId: row.tripId ?? undefined,
    failureReason: row.failureReason ?? undefined,
    processedByUserId: row.processedByUserId ?? undefined,
    processedByName: row.processedByName ?? undefined,
    createdAt: iso(row.createdAt),
  };
}

export function toTrip(row: DbTrip): Trip {
  return {
    id: row.id,
    reference: row.reference,
    passengerId: row.passengerId,
    passengerName: row.passengerName,
    accountId: row.accountId,
    qrId: row.qrId,
    busId: row.busId,
    busNumber: row.busNumber,
    conductorId: row.conductorId,
    conductorName: row.conductorName,
    routeId: row.routeId,
    routeName: row.routeName,
    boardingStop: row.boardingStop,
    destinationStop: row.destinationStop,
    fare: money(row.fare),
    status: row.status,
    failureReason: row.failureReason ?? undefined,
    createdAt: iso(row.createdAt),
  };
}

export function currentQr(qrs: DbQr[]) {
  return qrs.find((row) => row.status === "active") ?? qrs[0];
}

export function toPassengerDetail(
  passenger: DbPassenger,
  account: DbAccount,
  qrs: DbQr[],
  stats: PassengerDetail["stats"],
): PassengerDetail {
  const qr = currentQr(qrs);
  if (!qr) throw new Error("Staff QR account is missing.");
  return {
    passenger: toPassenger(passenger, account.id, qr.id),
    account: toAccount(account),
    qr: toQr(qr),
    identity: {
      ninMasked: passenger.ninMasked,
      address: passenger.address ?? undefined,
      city: passenger.city ?? undefined,
    },
    stats,
  };
}
