-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "pickup_label" VARCHAR(100);

-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "is_using_time_pickup" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "pickup_labels" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pickup_labels_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pickup_labels" ADD CONSTRAINT "pickup_labels_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
