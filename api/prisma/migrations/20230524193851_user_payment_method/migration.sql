-- CreateEnum
CREATE TYPE "PaymentMerchant" AS ENUM ('STRIPE', 'PAYPAL');

-- CreateTable
CREATE TABLE "user_payment_methods" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "default" BOOLEAN NOT NULL DEFAULT false,
    "payment_merchant" "PaymentMerchant" NOT NULL DEFAULT 'STRIPE',
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_payment_methods_user_id_key" ON "user_payment_methods"("user_id");

-- AddForeignKey
ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
