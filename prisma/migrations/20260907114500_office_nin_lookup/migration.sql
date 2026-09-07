-- AlterTable
ALTER TABLE "passengers" ADD COLUMN "ninHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "passengers_ninHash_key" ON "passengers"("ninHash");
