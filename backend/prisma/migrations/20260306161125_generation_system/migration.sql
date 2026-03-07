/*
  Warnings:

  - You are about to drop the column `cleanedContent` on the `ContentInput` table. All the data in the column will be lost.
  - You are about to drop the column `mode` on the `ContentInput` table. All the data in the column will be lost.
  - You are about to drop the column `rawContent` on the `ContentInput` table. All the data in the column will be lost.
  - You are about to drop the column `body` on the `GeneratedPost` table. All the data in the column will be lost.
  - You are about to drop the column `cta` on the `GeneratedPost` table. All the data in the column will be lost.
  - You are about to drop the column `finalFormatted` on the `GeneratedPost` table. All the data in the column will be lost.
  - You are about to drop the column `hook` on the `GeneratedPost` table. All the data in the column will be lost.
  - You are about to drop the column `tierUsed` on the `GenerationJob` table. All the data in the column will be lost.
  - The `status` column on the `GenerationJob` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[jobId,orderIndex]` on the table `GeneratedPost` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `ContentInput` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `GeneratedPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderIndex` to the `GeneratedPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `structureType` to the `GeneratedPost` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `GenerationJob` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentInputType" AS ENUM ('QUICK', 'REPURPOSE');

-- CreateEnum
CREATE TYPE "GenerationJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PostStructureType" AS ENUM ('HOOK_INSIGHT', 'STORY_LESSON', 'LIST', 'CONTRARIAN', 'EDUCATIONAL', 'FRAMEWORK');

-- DropIndex
DROP INDEX "ContentInput_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "ContentInput" DROP COLUMN "cleanedContent",
DROP COLUMN "mode",
DROP COLUMN "rawContent",
ADD COLUMN     "idea" TEXT,
ADD COLUMN     "topic" TEXT,
ADD COLUMN     "transcript" TEXT,
ADD COLUMN     "type" "ContentInputType" NOT NULL;

-- AlterTable
ALTER TABLE "GeneratedPost" DROP COLUMN "body",
DROP COLUMN "cta",
DROP COLUMN "finalFormatted",
DROP COLUMN "hook",
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "orderIndex" INTEGER NOT NULL,
ADD COLUMN     "structureType" "PostStructureType" NOT NULL;

-- AlterTable
ALTER TABLE "GenerationJob" DROP COLUMN "tierUsed",
ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "GenerationJobStatus" NOT NULL DEFAULT 'PENDING';

-- DropEnum
DROP TYPE "ContentMode";

-- DropEnum
DROP TYPE "GenerationStatus";

-- CreateIndex
CREATE INDEX "ContentInput_userId_idx" ON "ContentInput"("userId");

-- CreateIndex
CREATE INDEX "ContentInput_createdAt_idx" ON "ContentInput"("createdAt");

-- CreateIndex
CREATE INDEX "CreditLedger_referenceId_idx" ON "CreditLedger"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "GeneratedPost_jobId_orderIndex_key" ON "GeneratedPost"("jobId", "orderIndex");

-- CreateIndex
CREATE INDEX "GenerationJob_userId_idx" ON "GenerationJob"("userId");

-- CreateIndex
CREATE INDEX "GenerationJob_status_idx" ON "GenerationJob"("status");

-- CreateIndex
CREATE INDEX "GenerationJob_createdAt_idx" ON "GenerationJob"("createdAt");

-- CreateIndex
CREATE INDEX "GenerationJob_contentInputId_idx" ON "GenerationJob"("contentInputId");
