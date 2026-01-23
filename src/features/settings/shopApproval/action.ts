'use server';

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShopStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getShops(statusFilter?: ShopStatus[]) {
  const session = await auth();
  
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }

  // If no filter is provided, return all shops
  // If filter is provided, use current shop statuses
  // Note: The UI "ACTIVE" filter (Open/Closed) should be handled by passing [OPEN, CLOSED] from the client
  
  const where = statusFilter && statusFilter.length > 0
    ? { status: { in: statusFilter } }
    : {};

  try {
    const shops = await prisma.shop.findMany({
      where,
      include: {
        userRoles: {
            where: { role: 'OWNER' },
            include: { user: true },
            take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return { success: true, data: shops };
  } catch (error) {
    console.error("Error fetching shops:", error);
    return { success: false, error: "Failed to fetch shops" };
  }
}

export async function updateShopStatus(shopId: string, newStatus: ShopStatus) {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required");
    }

    try {
        await prisma.shop.update({
            where: { id: shopId },
            data: { status: newStatus }
        });

        revalidatePath("/settings/shopApproval");
        return { success: true };
    } catch (error) {
        console.error("Error updating shop status:", error);
        return { success: false, error: "Failed to update shop status" };
    }
}

export async function deleteShop(shopId: string) {
    const session = await auth();

    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized: Admin access required");
    }

    try {
        await prisma.shop.delete({
            where: { id: shopId }
        });

        revalidatePath("/settings/shopApproval");
        return { success: true };
    } catch (error) {
        console.error("Error deleting shop:", error);
        return { success: false, error: "Failed to delete shop" };
    }
}
