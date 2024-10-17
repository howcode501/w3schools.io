-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('User', 'Subscription', 'Product', 'App', 'Feature');

-- AlterTable
ALTER TABLE "attachments" ADD COLUMN     "attachment_type" "AttachmentType" NOT NULL DEFAULT 'Product';
