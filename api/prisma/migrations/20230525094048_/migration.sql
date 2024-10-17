/*
  Warnings:

  - A unique constraint covering the columns `[payment_id]` on the table `user_payment_methods` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_payment_methods_payment_id_key" ON "user_payment_methods"("payment_id");
