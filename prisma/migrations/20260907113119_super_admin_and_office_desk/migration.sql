-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'super_admin';
ALTER TYPE "UserRole" ADD VALUE 'officer';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "processedByName" TEXT,
ADD COLUMN     "processedByUserId" TEXT;

-- CreateIndex
CREATE INDEX "transactions_processedByUserId_createdAt_idx" ON "transactions"("processedByUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_processedByUserId_fkey" FOREIGN KEY ("processedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
