-- Reassign any existing CONFIRMED orders to PENDING before the value is removed.
-- These are paid-but-not-yet-ready orders; staff will mark them ready in one step.
-- This MUST run while the column still uses the old enum (CONFIRMED still valid).
UPDATE "orders" SET "order_status" = 'PENDING' WHERE "order_status" = 'CONFIRMED';

-- AlterEnum: recreate OrderStatus without CONFIRMED (Postgres cannot drop an enum value in place).
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'READY', 'CANCELLED', 'COMPLETED');
ALTER TABLE "orders" ALTER COLUMN "order_status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "order_status" TYPE "OrderStatus_new" USING ("order_status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "order_status" SET DEFAULT 'PENDING';
COMMIT;
