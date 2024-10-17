-- CreateTable
CREATE TABLE "api_keys" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "routes" JSONB,
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_email_key" ON "api_keys"("email");
