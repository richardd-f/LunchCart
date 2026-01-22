'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/types/ActionResult";
import { revalidatePath } from "next/cache";

export type WithdrawShopItem = {
  id: string;
  name: string;
  balance: number;
};

export async function getWithdrawalShops(query: string = ""): Promise<ActionResult<WithdrawShopItem[]>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const shops = await prisma.shop.findMany({
      where: {
        name: { contains: query, mode: "insensitive" }
      },
      include: {
        wallet: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    const formattedShops: WithdrawShopItem[] = shops.map(shop => ({
      id: shop.id,
      name: shop.name,
      // Handle missing wallet case (should exist if created properly, but default to 0)
      balance: shop.wallet ? Number(shop.wallet.balance) : 0
    }));

    return {
      success: true,
      data: formattedShops
    };

  } catch (error) {
    console.error("Error fetching shops for withdrawal:", error);
    return {
      success: false,
      error: "Failed to fetch shops"
    };
  }
}

export async function withdrawFromShop(shopId: string, amount: number, proofImage: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    if (!amount || amount <= 0) {
      return { success: false, error: "Invalid amount" };
    }

    if (!proofImage) {
      return { success: false, error: "Transfer proof image is required" };
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // Get shop wallet
      const wallet = await tx.shopWallet.findUnique({
        where: { shopId: shopId }
      });

      if (!wallet) {
        throw new Error("Shop wallet not found");
      }

      if (Number(wallet.balance) < amount) {
          throw new Error("Insufficient wallet balance");
      }

      await tx.shopWallet.update({
        where: { id: wallet.id },
        data: {
          balance: {
            decrement: amount
          }
        }
      });

      // Create Transaction record
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: "debit",
          amount: amount,
          proofImage: proofImage,
          description: "Admin Withdrawal",
        }
      });
    });

    revalidatePath("/withdraw");
    revalidatePath("/admin/withdraw"); // Just in case, though using /withdraw currently.

    return { success: true };

  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to process withdrawal"
    };
  }
}
