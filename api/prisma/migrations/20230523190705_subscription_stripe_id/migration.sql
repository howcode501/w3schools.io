-- AlterTable
ALTER TABLE "subscription_pricing_plan" ADD COLUMN     "stripe_price_id" TEXT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "stripe_product_id" TEXT;
