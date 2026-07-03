-- AlterTable
ALTER TABLE "shops" ADD COLUMN "timezone" VARCHAR(30) NOT NULL DEFAULT 'Asia/Jakarta';

-- AlterTable
ALTER TABLE "discounts" ADD COLUMN "active_days" TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']::TEXT[];
