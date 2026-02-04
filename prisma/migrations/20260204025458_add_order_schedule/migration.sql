-- CreateEnum
CREATE TYPE "OrderScheduleMode" AS ENUM ('OFF', 'ON');

-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "order_schedule_mode" "OrderScheduleMode" NOT NULL DEFAULT 'OFF';

-- CreateTable
CREATE TABLE "order_schedules" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "day" VARCHAR(10) NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_schedules_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "order_schedules" ADD CONSTRAINT "order_schedules_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
