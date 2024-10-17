-- CreateTable
CREATE TABLE "user_app_device_id" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "app_id" TEXT,
    "feature_id" TEXT,
    "device_id" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3),

    CONSTRAINT "user_app_device_id_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_app_device_id" ADD CONSTRAINT "user_app_device_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
