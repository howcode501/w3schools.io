-- CreateEnum
CREATE TYPE "SubscriptionFrequency" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "TriState" AS ENUM ('NotSet', 'Enabled', 'Disabled');

-- CreateEnum
CREATE TYPE "UserProductAppFeatureStatus" AS ENUM ('Global', 'Visible', 'Hidden');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('PasswordReset');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "auth_method_id" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT,

    CONSTRAINT "auth_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_method" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "auth_method_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "email" TEXT NOT NULL,
    "email_validated" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "public_url" TEXT,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "data" JSONB,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "description" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "can_delete" BOOLEAN NOT NULL DEFAULT true,
    "can_edit_options" BOOLEAN NOT NULL DEFAULT true,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_options" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_option_values" (
    "id" SERIAL NOT NULL,
    "value" BOOLEAN NOT NULL DEFAULT false,
    "role_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,

    CONSTRAINT "role_option_values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "web_sessions" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "web_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refreshtokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remember_me" BOOLEAN NOT NULL DEFAULT false,
    "valid_until" INTEGER NOT NULL,

    CONSTRAINT "refreshtokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onetimetokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL DEFAULT 'PasswordReset',
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" INTEGER NOT NULL,
    "valid" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "onetimetokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "not_type_id" INTEGER NOT NULL,
    "notifier_id" INTEGER,
    "data" JSONB,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status_id" INTEGER,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "notification_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_status" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "notification_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_id" TEXT,
    "product_status" BOOLEAN NOT NULL DEFAULT true,
    "product_description" TEXT,
    "product_learn_more" TEXT,
    "product_icon_id" INTEGER,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "apps" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "app_name" TEXT,
    "app_id" TEXT,
    "app_status" BOOLEAN NOT NULL DEFAULT true,
    "app_active_url" TEXT,
    "app_inactive_url" TEXT,
    "app_mailchimp_tag" TEXT[] DEFAULT ARRAY['NotSet']::TEXT[],
    "app_shopify_fulfill" TEXT[] DEFAULT ARRAY['NotSet']::TEXT[],
    "app_shopify_unfulfill" TEXT[] DEFAULT ARRAY['NotSet']::TEXT[],
    "app_icon_id" INTEGER,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "apps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "features" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "feature_name" TEXT,
    "feature_id" TEXT,
    "feature_status" BOOLEAN NOT NULL DEFAULT true,
    "feature_active_url" TEXT,
    "feature_inactive_url" TEXT,
    "feature_mailchimp_tag" TEXT[] DEFAULT ARRAY['NotSet']::TEXT[],
    "feature_shopify_fulfill" TEXT[] DEFAULT ARRAY['NotSet']::TEXT[],
    "feature_shopify_unfulfill" TEXT[] DEFAULT ARRAY['NotSet']::TEXT[],
    "feature_icon_id" INTEGER,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "subscription_name" TEXT NOT NULL,
    "subscription_descripton" TEXT,
    "subscription_icon_id" INTEGER,
    "mailchimp_tag" TEXT[] DEFAULT ARRAY['NotSet']::TEXT[],
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" TIMESTAMP(3),
    "status" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_pricing_plan" (
    "id" SERIAL NOT NULL,
    "subscription_id" INTEGER NOT NULL,
    "time_option_date" INTEGER,
    "time_option_frequency" "SubscriptionFrequency" NOT NULL DEFAULT 'DAY',
    "price" INTEGER,
    "free_with_new_account" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "shopify_fulfill" TEXT[] DEFAULT ARRAY['NotSet']::TEXT[],
    "shopify_unfulfill" TEXT[] DEFAULT ARRAY['NotSet']::TEXT[],
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" TIMESTAMP(3),

    CONSTRAINT "subscription_pricing_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "user_email" TEXT,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "activated_details" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expire_date_time" TIMESTAMP(3),
    "activated_date_time" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_products_apps_features" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" INTEGER,
    "app_id" INTEGER,
    "feature_id" INTEGER,
    "activated_by" TEXT,
    "description" TEXT,
    "data_type" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "visible_status" "UserProductAppFeatureStatus" NOT NULL DEFAULT 'Global',
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated_date_time" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "user_products_apps_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_subscriptions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_id" INTEGER NOT NULL,
    "subscription_plan_id" INTEGER NOT NULL,
    "activated_by" TEXT,
    "description" TEXT,
    "auto_subscription" BOOLEAN NOT NULL DEFAULT false,
    "stripe_canceled_at" TIMESTAMP(3),
    "stripe_current_period_end" TIMESTAMP(3),
    "stripe_current_period_start" TIMESTAMP(3),
    "stripe_start_date" TIMESTAMP(3),
    "stripe_customer_id" TEXT,
    "stripe_ended_at" TEXT,
    "stripe_plan_amount" TEXT,
    "stripe_plan_count" TEXT,
    "stripe_plan_interval" TEXT,
    "stripe_status" TEXT,
    "subscription_group_id" TEXT,
    "subscription_name" TEXT,
    "subscription_prod_id" TEXT,
    "time_option_date" INTEGER,
    "time_option_frequency" "SubscriptionFrequency" NOT NULL DEFAULT 'DAY',
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated_date_time" TIMESTAMP(3),
    "deleted" TIMESTAMP(3),

    CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "field_type" TEXT NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_user_roles" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_subscription_products" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_promocode_products" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_subscription_apps" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_promocode_apps" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_subscription_features" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_promocode_features" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_promocode_subscriptions" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_promocode_subscription_pricing_plans" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "auth_profiles_user_id_key" ON "auth_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auth_method_name_key" ON "auth_method"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "user_profiles"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "role_options_name_key" ON "role_options"("name");

-- CreateIndex
CREATE UNIQUE INDEX "web_sessions_sid_key" ON "web_sessions"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "refreshtokens_user_id_key" ON "refreshtokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_type_name_key" ON "notification_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "notification_status_name_key" ON "notification_status"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_product_name_key" ON "products"("product_name");

-- CreateIndex
CREATE UNIQUE INDEX "products_product_id_key" ON "products"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_product_icon_id_key" ON "products"("product_icon_id");

-- CreateIndex
CREATE UNIQUE INDEX "apps_app_name_key" ON "apps"("app_name");

-- CreateIndex
CREATE UNIQUE INDEX "apps_app_id_key" ON "apps"("app_id");

-- CreateIndex
CREATE UNIQUE INDEX "apps_app_icon_id_key" ON "apps"("app_icon_id");

-- CreateIndex
CREATE UNIQUE INDEX "features_feature_name_key" ON "features"("feature_name");

-- CreateIndex
CREATE UNIQUE INDEX "features_feature_id_key" ON "features"("feature_id");

-- CreateIndex
CREATE UNIQUE INDEX "features_feature_icon_id_key" ON "features"("feature_icon_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_subscription_name_key" ON "subscriptions"("subscription_name");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_subscription_icon_id_key" ON "subscriptions"("subscription_icon_id");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_name_key" ON "system_config"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_user_roles_AB_unique" ON "_user_roles"("A", "B");

-- CreateIndex
CREATE INDEX "_user_roles_B_index" ON "_user_roles"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_subscription_products_AB_unique" ON "_subscription_products"("A", "B");

-- CreateIndex
CREATE INDEX "_subscription_products_B_index" ON "_subscription_products"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_promocode_products_AB_unique" ON "_promocode_products"("A", "B");

-- CreateIndex
CREATE INDEX "_promocode_products_B_index" ON "_promocode_products"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_subscription_apps_AB_unique" ON "_subscription_apps"("A", "B");

-- CreateIndex
CREATE INDEX "_subscription_apps_B_index" ON "_subscription_apps"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_promocode_apps_AB_unique" ON "_promocode_apps"("A", "B");

-- CreateIndex
CREATE INDEX "_promocode_apps_B_index" ON "_promocode_apps"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_subscription_features_AB_unique" ON "_subscription_features"("A", "B");

-- CreateIndex
CREATE INDEX "_subscription_features_B_index" ON "_subscription_features"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_promocode_features_AB_unique" ON "_promocode_features"("A", "B");

-- CreateIndex
CREATE INDEX "_promocode_features_B_index" ON "_promocode_features"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_promocode_subscriptions_AB_unique" ON "_promocode_subscriptions"("A", "B");

-- CreateIndex
CREATE INDEX "_promocode_subscriptions_B_index" ON "_promocode_subscriptions"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_promocode_subscription_pricing_plans_AB_unique" ON "_promocode_subscription_pricing_plans"("A", "B");

-- CreateIndex
CREATE INDEX "_promocode_subscription_pricing_plans_B_index" ON "_promocode_subscription_pricing_plans"("B");

-- AddForeignKey
ALTER TABLE "auth_profiles" ADD CONSTRAINT "auth_profiles_auth_method_id_fkey" FOREIGN KEY ("auth_method_id") REFERENCES "auth_method"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_profiles" ADD CONSTRAINT "auth_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_option_values" ADD CONSTRAINT "role_option_values_option_id_fkey" FOREIGN KEY ("option_id") REFERENCES "role_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_option_values" ADD CONSTRAINT "role_option_values_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refreshtokens" ADD CONSTRAINT "refreshtokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onetimetokens" ADD CONSTRAINT "onetimetokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_not_type_id_fkey" FOREIGN KEY ("not_type_id") REFERENCES "notification_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "notification_status"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_product_icon_id_fkey" FOREIGN KEY ("product_icon_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "apps" ADD CONSTRAINT "apps_app_icon_id_fkey" FOREIGN KEY ("app_icon_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "features" ADD CONSTRAINT "features_feature_icon_id_fkey" FOREIGN KEY ("feature_icon_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscription_icon_id_fkey" FOREIGN KEY ("subscription_icon_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_pricing_plan" ADD CONSTRAINT "subscription_pricing_plan_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_products_apps_features" ADD CONSTRAINT "user_products_apps_features_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_products_apps_features" ADD CONSTRAINT "user_products_apps_features_app_id_fkey" FOREIGN KEY ("app_id") REFERENCES "apps"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_products_apps_features" ADD CONSTRAINT "user_products_apps_features_feature_id_fkey" FOREIGN KEY ("feature_id") REFERENCES "features"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_products_apps_features" ADD CONSTRAINT "user_products_apps_features_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_pricing_plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_roles" ADD CONSTRAINT "_user_roles_A_fkey" FOREIGN KEY ("A") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_user_roles" ADD CONSTRAINT "_user_roles_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_subscription_products" ADD CONSTRAINT "_subscription_products_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_subscription_products" ADD CONSTRAINT "_subscription_products_B_fkey" FOREIGN KEY ("B") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_promocode_products" ADD CONSTRAINT "_promocode_products_A_fkey" FOREIGN KEY ("A") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_promocode_products" ADD CONSTRAINT "_promocode_products_B_fkey" FOREIGN KEY ("B") REFERENCES "promo_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_subscription_apps" ADD CONSTRAINT "_subscription_apps_A_fkey" FOREIGN KEY ("A") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_subscription_apps" ADD CONSTRAINT "_subscription_apps_B_fkey" FOREIGN KEY ("B") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_promocode_apps" ADD CONSTRAINT "_promocode_apps_A_fkey" FOREIGN KEY ("A") REFERENCES "apps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_promocode_apps" ADD CONSTRAINT "_promocode_apps_B_fkey" FOREIGN KEY ("B") REFERENCES "promo_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_subscription_features" ADD CONSTRAINT "_subscription_features_A_fkey" FOREIGN KEY ("A") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_subscription_features" ADD CONSTRAINT "_subscription_features_B_fkey" FOREIGN KEY ("B") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_promocode_features" ADD CONSTRAINT "_promocode_features_A_fkey" FOREIGN KEY ("A") REFERENCES "features"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_promocode_features" ADD CONSTRAINT "_promocode_features_B_fkey" FOREIGN KEY ("B") REFERENCES "promo_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_promocode_subscriptions" ADD CONSTRAINT "_promocode_subscriptions_A_fkey" FOREIGN KEY ("A") REFERENCES "promo_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_promocode_subscriptions" ADD CONSTRAINT "_promocode_subscriptions_B_fkey" FOREIGN KEY ("B") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_promocode_subscription_pricing_plans" ADD CONSTRAINT "_promocode_subscription_pricing_plans_A_fkey" FOREIGN KEY ("A") REFERENCES "promo_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_promocode_subscription_pricing_plans" ADD CONSTRAINT "_promocode_subscription_pricing_plans_B_fkey" FOREIGN KEY ("B") REFERENCES "subscription_pricing_plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
