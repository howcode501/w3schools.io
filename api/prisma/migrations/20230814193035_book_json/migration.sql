/*
  Warnings:

  - You are about to drop the column `book_json` on the `features` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "features" DROP COLUMN "book_json",
ADD COLUMN     "book_json_id" INTEGER,
ADD COLUMN     "book_json_path" TEXT;
