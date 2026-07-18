-- Coin-priced menus and coin-paid orders.

-- AlterTable
ALTER TABLE "meals" ADD COLUMN "is_coin_menu" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "coin_price" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN "paid_with_coins" INTEGER NOT NULL DEFAULT 0;
