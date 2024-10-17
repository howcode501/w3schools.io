/*
  Warnings:

  - You are about to drop the column `order_name` on the `shopify` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "shopify" DROP COLUMN "order_name",
ADD COLUMN     "mail" TEXT,
ADD COLUMN     "order_number" TEXT,
ADD COLUMN     "redeem_code" TEXT;
