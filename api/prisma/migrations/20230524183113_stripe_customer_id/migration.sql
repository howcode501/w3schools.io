/*
  Warnings:

  - You are about to drop the column `stripe_customer_id` on the `user_subscriptions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_subscriptions" DROP COLUMN "stripe_customer_id";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "stripe_customer_id" TEXT;
