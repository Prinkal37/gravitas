/*
  Warnings:

  - The values [DEDUCTION,REFUND,PURCHASE,RENEWAL] on the enum `CreditLedgerType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CreditLedgerType_new" AS ENUM ('SUBSCRIPTION_CREDIT', 'GENERATION_DEDUCTION', 'GENERATION_REFUND', 'EXTRA_CREDIT_PURCHASE', 'ADMIN_ADJUSTMENT', 'SIGNUP_BONUS', 'ACTIVATION_BONUS');
ALTER TABLE "CreditLedger" ALTER COLUMN "type" TYPE "CreditLedgerType_new" USING ("type"::text::"CreditLedgerType_new");
ALTER TYPE "CreditLedgerType" RENAME TO "CreditLedgerType_old";
ALTER TYPE "CreditLedgerType_new" RENAME TO "CreditLedgerType";
DROP TYPE "CreditLedgerType_old";
COMMIT;

-- AlterTable
ALTER TABLE "CreditLedger" ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "referenceId" TEXT;
