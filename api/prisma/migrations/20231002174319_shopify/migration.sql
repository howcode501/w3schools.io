-- CreateTable
CREATE TABLE "shopify" (
    "id" SERIAL NOT NULL,
    "order_id" TEXT,
    "order_name" TEXT,
    "email" TEXT,
    "message" TEXT,
    "apps" JSONB,
    "Features" JSONB,
    "fullfilled_line_items" JSONB,
    "request_object" JSONB,
    "user_exits" BOOLEAN NOT NULL DEFAULT false,
    "purchased" BOOLEAN NOT NULL DEFAULT false,
    "mail_sent" BOOLEAN NOT NULL DEFAULT false,
    "last_used" TIMESTAMP(3),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3),

    CONSTRAINT "shopify_pkey" PRIMARY KEY ("id")
);
