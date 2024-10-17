/*
  Warnings:

  - You are about to drop the column `book_isbn_number` on the `features` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "features" DROP COLUMN "book_isbn_number",
ADD COLUMN     "book_isbn_number_10" TEXT,
ADD COLUMN     "book_isbn_number_13" TEXT;
