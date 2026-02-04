'use server';

import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/types/ActionResult";
import { Shop, MealCategory } from "@prisma/client";

export type ShopDetails = Shop;

// Serializable type - price converted from Decimal to number
export type ShopMenuWithImages = {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number; // Converted from Decimal
  discountPrice: number;
  category: MealCategory;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: { imagePath: string; isPrimary: boolean }[];
};

export async function getShopDetails(shopId: string): Promise<ActionResult<ShopDetails>> {
  try {
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return { success: false, error: "Shop not found" };
    }

    return { success: true, data: shop };
  } catch (error) {
    console.error("Error fetching shop details:", error);
    return { success: false, error: "Failed to fetch shop details" };
  }
}

export async function getShopMenus(
  shopId: string,
  category?: MealCategory
): Promise<ActionResult<ShopMenuWithImages[]>> {
  try {
    const whereClause: any = {
      shopId,
      isAvailable: true,
    };

    if (category) {
      whereClause.category = category;
    }

    const menus = await prisma.meal.findMany({
      where: whereClause,
      include: {
        images: {
          select: { imagePath: true, isPrimary: true },
          orderBy: { isPrimary: 'desc' }
        },
      },
      orderBy: [
        { orderNumber: 'asc' },
        { createdAt: 'asc' }
      ],
    });

    // Convert Decimal to number for serialization
    const serializedMenus: ShopMenuWithImages[] = menus.map(menu => ({
      ...menu,
      price: Number(menu.price),
      discountPrice: Number(menu.discountPrice),
    }));

    return { success: true, data: serializedMenus };
    
  } catch (error) {
    console.error("Error fetching shop menus:", error);
    return { success: false, error: "Failed to fetch menus" };
  }
}

export async function getNewShopMenus(shopId: string, limit = 5): Promise<ActionResult<ShopMenuWithImages[]>> {
    try {
        const newMenus = await prisma.meal.findMany({
            where: {
                shopId,
                isAvailable: true,
            },
            include: {
                images: {
                    select: { imagePath: true, isPrimary: true },
                    orderBy: { isPrimary: 'desc' }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        // Convert Decimal to number for serialization
        const serializedMenus: ShopMenuWithImages[] = newMenus.map(menu => ({
            ...menu,
            price: Number(menu.price),
            discountPrice: Number(menu.discountPrice),
        }));

        return { success: true, data: serializedMenus };
    } catch (error) {
        console.error("Error fetching new shop menus:", error);
        return { success: false, error: "Failed to fetch new menus" };
    }
}
