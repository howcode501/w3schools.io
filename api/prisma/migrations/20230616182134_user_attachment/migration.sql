/*
  Warnings:

  - A unique constraint covering the columns `[user_icon_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "user_icon_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "users_user_icon_id_key" ON "users"("user_icon_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_user_icon_id_fkey" FOREIGN KEY ("user_icon_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
