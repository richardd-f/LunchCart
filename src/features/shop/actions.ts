'use server';

import { Shop, ShopStatus } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/types/ActionResult";
import { revalidatePath } from "next/cache";

export type UpdateShopInput = {
  name: string;
  address: string;
  phone: string;
  description: string;
  status: ShopStatus;
  profileImage?: string;
};

export async function updateShop(formData: UpdateShopInput): Promise<ActionResult<Shop>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Check if user is an owner of any shop
    const userShopRole = await prisma.userShopRole.findFirst({
      where: {
        userId: session.user.id,
        role: "OWNER",
      },
      include: {
        shop: true,
      },
    });

    if (!userShopRole || !userShopRole.shop) {
      return {
        success: false,
        error: "You are not an owner of any shop.",
      };
    }

    const shopId = userShopRole.shopId;

    // Detect if name is being changed and check uniqueness
    if (formData.name !== userShopRole.shop.name) {
      const existingShop = await prisma.shop.findUnique({
        where: { name: formData.name },
      });
      if (existingShop) {
        return {
          success: false,
          error: "Shop name already taken.",
        };
      }
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        description: formData.description,
        status: formData.status,
        profileImage: formData.profileImage,
      },
    });

    revalidatePath("/manage/shop");
    return {
      success: true,
      data: updatedShop,
    };
  } catch (error) {
    console.error("Error updating shop:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update shop",
    };
  }
}

export async function getManagedShop(): Promise<ActionResult<Shop>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userShopRole = await prisma.userShopRole.findFirst({
      where: {
        userId: session.user.id,
        role: "OWNER",
      },
      include: {
        shop: true,
      },
    });

    if (!userShopRole || !userShopRole.shop) {
       // Check if they are staff but not owner, for clarity? 
       // Requirement says "check UserShopRole table, if user is owner, then can open this page"
       // So if not owner, return null/error.
      return {
        success: false,
        error: "No shop found for this owner.",
      };
    }

    return {
      success: true,
      data: userShopRole.shop,
    };
  } catch (error) {
    console.error("Error fetching shop:", error);
    return {
      success: false,
      error: "Failed to fetch shop details",
    };
  }
}
