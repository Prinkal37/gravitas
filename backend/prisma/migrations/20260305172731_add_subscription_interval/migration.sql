/*
  Warnings:

  - Added the required column `interval` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubscriptionInterval" AS ENUM ('MONTHLY', 'ANNUAL');

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "interval" "SubscriptionInterval" NOT NULL;
