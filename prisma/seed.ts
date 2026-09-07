import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import {
  accounts,
  buses,
  conductors,
  fares,
  identities,
  passengers,
  qrAccounts,
  routes,
  transactions,
  trips,
  users,
} from "../src/data/store";
import { demoNinForStaffNumber, hashNin, maskNin } from "../src/lib/nin";
import { DEMO_PASSWORD } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await prisma.trip.deleteMany();
  await prisma.ledgerTransaction.deleteMany();
  await prisma.conductorSession.deleteMany();
  await prisma.session.deleteMany();
  await prisma.qrAccount.deleteMany();
  await prisma.transportAccount.deleteMany();
  await prisma.fare.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.conductor.deleteMany();
  await prisma.transportRoute.deleteMany();
  await prisma.passenger.deleteMany();
  await prisma.user.deleteMany();

  const userRows = users.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    passwordHash,
    role: row.role,
    status: row.status,
    createdAt: new Date(row.createdAt),
  }));

  for (const passenger of passengers) {
    if (userRows.some((row) => row.id === passenger.userId)) continue;
    userRows.push({
      id: passenger.userId,
      name: passenger.name,
      email: passenger.email,
      phone: passenger.phone,
      passwordHash,
      role: "passenger",
      status: passenger.status,
      createdAt: new Date(passenger.createdAt),
    });
  }

  await prisma.user.createMany({ data: userRows });

  await prisma.passenger.createMany({
    data: passengers.map((row) => {
      const identity = identities[row.id];
      return {
        id: row.id,
        userId: row.userId,
        name: row.name,
        email: row.email,
        phone: row.phone,
        staffNumber: row.staffNumber,
        designation: row.designation,
        facility: row.facility,
        status: row.status,
        ninMasked: identity?.ninMasked ?? maskNin(demoNinForStaffNumber(row.staffNumber)),
        ninHash: hashNin(demoNinForStaffNumber(row.staffNumber)) ?? undefined,
        address: identity?.address,
        city: identity?.city,
        createdAt: new Date(row.createdAt),
      };
    }),
  });

  await prisma.transportAccount.createMany({
    data: accounts.map((row) => ({
      id: row.id,
      passengerId: row.passengerId,
      accountNumber: row.accountNumber,
      balance: row.balance,
      status: row.status,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    })),
  });

  await prisma.qrAccount.createMany({
    data: qrAccounts.map((row) => ({
      id: row.id,
      accountId: row.accountId,
      passengerId: row.passengerId,
      passengerName: row.passengerName,
      secureToken: row.secureToken,
      status: row.status,
      createdAt: new Date(row.createdAt),
      revokedAt: row.revokedAt ? new Date(row.revokedAt) : null,
      replacedByQrId: row.replacedByQrId,
      lastScannedAt: row.lastScannedAt ? new Date(row.lastScannedAt) : null,
      scanCount: row.scanCount,
    })),
  });

  await prisma.transportRoute.createMany({
    data: routes.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      origin: row.origin,
      destination: row.destination,
        stops: row.stops as unknown as Prisma.InputJsonValue,
      distanceKm: row.distanceKm,
      fare: row.fare,
      status: row.status,
      createdAt: new Date(row.createdAt),
    })),
  });

  await prisma.fare.createMany({
    data: fares.map((row) => ({
      id: row.id,
      name: row.name,
      routeId: row.routeId,
      routeName: row.routeName,
      category: row.category,
      amount: row.amount,
      status: row.status,
      effectiveFrom: new Date(row.effectiveFrom),
      effectiveTo: row.effectiveTo ? new Date(row.effectiveTo) : null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    })),
  });

  await prisma.conductor.createMany({
    data: conductors.map((row) => ({
      id: row.id,
      staffNumber: row.staffNumber,
      name: row.name,
      contact: row.contact,
      email: row.email,
      passwordHash,
      busId: row.busId,
      busNumber: row.busNumber,
      status: row.status,
      tripsProcessed: row.tripsProcessed,
      lastActiveAt: row.lastActiveAt ? new Date(row.lastActiveAt) : null,
      createdAt: new Date(row.createdAt),
    })),
  });

  await prisma.bus.createMany({
    data: buses.map((row) => ({
      id: row.id,
      busNumber: row.busNumber,
      registrationNumber: row.registrationNumber,
      routeId: row.routeId,
      routeName: row.routeName,
      conductorId: row.conductorId,
      conductorName: row.conductorName,
      capacity: row.capacity,
      status: row.status,
      createdAt: new Date(row.createdAt),
    })),
  });

  await prisma.ledgerTransaction.createMany({
    data: transactions.map((row) => ({
      id: row.id,
      reference: row.reference,
      accountId: row.accountId,
      passengerId: row.passengerId,
      passengerName: row.passengerName,
      type: row.type,
      description: row.description,
      amount: row.amount,
      balanceAfter: row.balanceAfter,
      status: row.status,
      method: row.method,
      tripId: row.tripId,
      failureReason: row.failureReason,
      createdAt: new Date(row.createdAt),
    })),
  });

  await prisma.trip.createMany({
    data: trips.map((row) => ({
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
      fare: row.fare,
      status: row.status,
      failureReason: row.failureReason,
      createdAt: new Date(row.createdAt),
    })),
  });

  console.log(`Seeded ${userRows.length} users, ${passengers.length} staff, ${conductors.length} conductors.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
