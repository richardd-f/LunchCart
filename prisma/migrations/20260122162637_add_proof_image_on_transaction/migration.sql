-- AlterEnum
ALTER TYPE "MealCategory" ADD VALUE 'TOOL';

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "proof_image" TEXT;
