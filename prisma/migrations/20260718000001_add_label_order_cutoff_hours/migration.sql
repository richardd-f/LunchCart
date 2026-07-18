-- Label Pickup cutoff: orders for day D close X hours before D's midnight (shop timezone).
ALTER TABLE "shops" ADD COLUMN "label_order_cutoff_hours" INTEGER NOT NULL DEFAULT 3;
