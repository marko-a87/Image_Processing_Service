-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockedUntil" TIMESTAMP(3),
ADD COLUMN     "refreshTokenHash" TEXT,
ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;
