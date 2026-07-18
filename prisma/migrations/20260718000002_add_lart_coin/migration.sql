-- Lart Coin loyalty system: user balances, transaction ledger, admin-editable rates.

-- CreateEnum
CREATE TYPE "LartCoinTransactionType" AS ENUM ('EARN', 'SPEND', 'ADJUST');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "lart_coin_balance" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "lart_coin_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "purchase_amount_per_coin" INTEGER NOT NULL DEFAULT 10000,
    "coin_value_rupiah" INTEGER NOT NULL DEFAULT 1000,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lart_coin_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lart_coin_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT,
    "type" "LartCoinTransactionType" NOT NULL,
    "coins" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lart_coin_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lart_coin_transactions_user_id_created_at_idx" ON "lart_coin_transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "lart_coin_transactions_order_id_idx" ON "lart_coin_transactions"("order_id");

-- AddForeignKey
ALTER TABLE "lart_coin_transactions" ADD CONSTRAINT "lart_coin_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lart_coin_transactions" ADD CONSTRAINT "lart_coin_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
