-- CreateEnum
CREATE TYPE "BirthdayEmailStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'DEAD');

-- CreateTable
CREATE TABLE "BirthdayEmailLog" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "birthdayYear" INTEGER NOT NULL,
    "status" "BirthdayEmailStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "nextRetryAt" TIMESTAMP(3),
    "lockedUntil" TIMESTAMP(3),
    "lockToken" TEXT,
    "providerMessageId" TEXT,
    "sentAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BirthdayEmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BirthdayEmailLog_memberId_birthdayYear_key" ON "BirthdayEmailLog"("memberId", "birthdayYear");

-- CreateIndex
CREATE INDEX "BirthdayEmailLog_status_nextRetryAt_idx" ON "BirthdayEmailLog"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX "BirthdayEmailLog_status_lockedUntil_idx" ON "BirthdayEmailLog"("status", "lockedUntil");

-- AddForeignKey
ALTER TABLE "BirthdayEmailLog" ADD CONSTRAINT "BirthdayEmailLog_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
