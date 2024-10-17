/*
  Warnings:

  - You are about to drop the column `subscription_descripton` on the `subscriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "subscription_descripton",
ADD COLUMN     "subscription_description" TEXT;
