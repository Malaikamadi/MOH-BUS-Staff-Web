-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('passenger', 'admin');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'suspended', 'pending', 'closed');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "BusStatus" AS ENUM ('active', 'maintenance', 'inactive');

-- CreateEnum
CREATE TYPE "QrStatus" AS ENUM ('active', 'disabled', 'replaced');

-- CreateEnum
CREATE TYPE "FareCategory" AS ENUM ('staff');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('recharge', 'fare', 'refund', 'adjustment');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('successful', 'pending', 'failed', 'reversed');

-- CreateEnum
CREATE TYPE "PaymentMethodId" AS ENUM ('card', 'bank_transfer', 'ussd', 'mobile_money', 'agent');

-- CreateEnum
CREATE TYPE "TripStatus" AS ENUM ('completed', 'in_progress', 'failed', 'cancelled');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "AccountStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passengers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "staffNumber" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "facility" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL,
    "ninMasked" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_accounts" (
    "id" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL,
    "status" "AccountStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "passengerName" TEXT NOT NULL,
    "secureToken" TEXT NOT NULL,
    "status" "QrStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedByQrId" TEXT,
    "lastScannedAt" TIMESTAMP(3),
    "scanCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "qr_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "stops" JSONB NOT NULL,
    "distanceKm" DECIMAL(8,1) NOT NULL,
    "fare" DECIMAL(12,2) NOT NULL,
    "status" "EntityStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fares" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "category" "FareCategory" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "EntityStatus" NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conductors" (
    "id" TEXT NOT NULL,
    "staffNumber" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "busId" TEXT,
    "busNumber" TEXT,
    "status" "AccountStatus" NOT NULL,
    "tripsProcessed" INTEGER NOT NULL DEFAULT 0,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conductors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conductor_sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "conductorId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conductor_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buses" (
    "id" TEXT NOT NULL,
    "busNumber" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "routeId" TEXT,
    "routeName" TEXT,
    "conductorId" TEXT,
    "conductorName" TEXT,
    "capacity" INTEGER NOT NULL,
    "status" "BusStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "passengerName" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "balanceAfter" DECIMAL(12,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "method" "PaymentMethodId",
    "tripId" TEXT,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "passengerName" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "qrId" TEXT NOT NULL,
    "busId" TEXT NOT NULL,
    "busNumber" TEXT NOT NULL,
    "conductorId" TEXT NOT NULL,
    "conductorName" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "routeName" TEXT NOT NULL,
    "boardingStop" TEXT NOT NULL,
    "destinationStop" TEXT NOT NULL,
    "fare" DECIMAL(12,2) NOT NULL,
    "status" "TripStatus" NOT NULL,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "passengers_userId_key" ON "passengers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "passengers_staffNumber_key" ON "passengers"("staffNumber");

-- CreateIndex
CREATE INDEX "passengers_status_idx" ON "passengers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "transport_accounts_passengerId_key" ON "transport_accounts"("passengerId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_accounts_accountNumber_key" ON "transport_accounts"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "qr_accounts_secureToken_key" ON "qr_accounts"("secureToken");

-- CreateIndex
CREATE INDEX "qr_accounts_passengerId_idx" ON "qr_accounts"("passengerId");

-- CreateIndex
CREATE UNIQUE INDEX "routes_code_key" ON "routes"("code");

-- CreateIndex
CREATE INDEX "fares_routeId_status_idx" ON "fares"("routeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "conductors_staffNumber_key" ON "conductors"("staffNumber");

-- CreateIndex
CREATE UNIQUE INDEX "conductor_sessions_token_key" ON "conductor_sessions"("token");

-- CreateIndex
CREATE INDEX "conductor_sessions_conductorId_idx" ON "conductor_sessions"("conductorId");

-- CreateIndex
CREATE UNIQUE INDEX "buses_busNumber_key" ON "buses"("busNumber");

-- CreateIndex
CREATE UNIQUE INDEX "buses_registrationNumber_key" ON "buses"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");

-- CreateIndex
CREATE INDEX "transactions_passengerId_createdAt_idx" ON "transactions"("passengerId", "createdAt");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "trips_reference_key" ON "trips"("reference");

-- CreateIndex
CREATE INDEX "trips_passengerId_createdAt_idx" ON "trips"("passengerId", "createdAt");

-- CreateIndex
CREATE INDEX "trips_conductorId_createdAt_idx" ON "trips"("conductorId", "createdAt");

-- CreateIndex
CREATE INDEX "trips_createdAt_idx" ON "trips"("createdAt");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_accounts" ADD CONSTRAINT "transport_accounts_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "passengers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_accounts" ADD CONSTRAINT "qr_accounts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "transport_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_accounts" ADD CONSTRAINT "qr_accounts_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "passengers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fares" ADD CONSTRAINT "fares_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conductor_sessions" ADD CONSTRAINT "conductor_sessions_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "conductors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buses" ADD CONSTRAINT "buses_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "transport_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "passengers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "passengers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "transport_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_qrId_fkey" FOREIGN KEY ("qrId") REFERENCES "qr_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_busId_fkey" FOREIGN KEY ("busId") REFERENCES "buses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_conductorId_fkey" FOREIGN KEY ("conductorId") REFERENCES "conductors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
