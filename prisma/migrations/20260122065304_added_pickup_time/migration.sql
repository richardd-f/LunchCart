-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "fixed_time_pickup" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "pickup_times" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "time" VARCHAR(5) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_times_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pickup_times" ADD CONSTRAINT "pickup_times_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
