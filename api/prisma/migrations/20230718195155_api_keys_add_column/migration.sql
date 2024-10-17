/*
  Warnings:

  - Added the required column `key` to the `api_keys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "key" TEXT NOT NULL;
