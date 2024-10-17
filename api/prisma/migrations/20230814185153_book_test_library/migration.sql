-- AlterEnum
ALTER TYPE "AttachmentType" ADD VALUE 'BookJSON';

-- AlterTable
ALTER TABLE "features" ADD COLUMN     "book_is_dictinoary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "book_isbn_number" TEXT,
ADD COLUMN     "book_json" TEXT,
ADD COLUMN     "book_purchase_link" TEXT;
