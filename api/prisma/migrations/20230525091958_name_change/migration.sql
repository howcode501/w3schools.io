/*
  Warnings:

  - You are about to drop the column `default` on the `user_payment_methods` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_payment_methods" DROP COLUMN "default",
ADD COLUMN     "is_default" BOOLEAN NOT NULL DEFAULT false;
