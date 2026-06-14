-- AddColumn: flag pickup labels that should expose a live queue to customers.
ALTER TABLE "pickup_labels" ADD COLUMN "is_live_queue" BOOLEAN NOT NULL DEFAULT false;
