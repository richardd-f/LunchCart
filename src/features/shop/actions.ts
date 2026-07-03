'use server';

import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/types/ActionResult";
import { Shop, MealCategory } from "@prisma/client";
import { getMealDiscountPreview, MealDiscountPreview } from "@/features/discounts/getMealDiscountPreview";
import { getTodayName } from "@/features/discounts/activeDays";

export type ShopDetails = Shop;

// Serializable type - price converted from Decimal to number
export type ShopMenuWithImages = {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number; // Converted from Decimal
  hasActiveDiscount: boolean;
  discountPreview: MealDiscountPreview | null;
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

    // Resolve "today" in the shop's timezone for the discount day-schedule.
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { timezone: true },
    });
    const today = getTodayName(shop?.timezone ?? 'Asia/Jakarta');

    const menus = await prisma.meal.findMany({
      where: whereClause,
      include: {
        images: {
          select: { imagePath: true, isPrimary: true },
          orderBy: { isPrimary: 'desc' }
        },
        discounts: {
          where: { isActive: true, activeDays: { has: today } },
          select: { id: true, percentage: true, minOrderSubtotal: true, maxDiscountAmount: true },
        },
      },
      orderBy: [
        { orderNumber: 'asc' },
        { createdAt: 'asc' }
      ],
    });

    // Convert Decimal to number for serialization
    const serializedMenus: ShopMenuWithImages[] = menus.map((menu) => {
      const { discountPrice: _omitDiscountPrice, discounts, ...rest } = menu;
      const price = Number(menu.price);
      return {
        ...rest,
        price,
        hasActiveDiscount: discounts.length > 0,
        discountPreview: getMealDiscountPreview(
          price,
          discounts.map((d) => ({
            percentage: Number(d.percentage),
            minOrderSubtotal: Number(d.minOrderSubtotal),
            maxDiscountAmount: Number(d.maxDiscountAmount),
          }))
        ),
      };
    });

    return { success: true, data: serializedMenus };
    
  } catch (error) {
    console.error("Error fetching shop menus:", error);
    return { success: false, error: "Failed to fetch menus" };
  }
}

export async function getNewShopMenus(shopId: string, limit = 5): Promise<ActionResult<ShopMenuWithImages[]>> {
    try {
        const shop = await prisma.shop.findUnique({
            where: { id: shopId },
            select: { timezone: true },
        });
        const today = getTodayName(shop?.timezone ?? 'Asia/Jakarta');

        const newMenus = await prisma.meal.findMany({
            where: {
                shopId,
                isAvailable: true,
            },
            include: {
                images: {
                    select: { imagePath: true, isPrimary: true },
                    orderBy: { isPrimary: 'desc' }
                },
                discounts: {
                    where: { isActive: true, activeDays: { has: today } },
                    select: { id: true, percentage: true, minOrderSubtotal: true, maxDiscountAmount: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        // Convert Decimal to number for serialization
        const serializedMenus: ShopMenuWithImages[] = newMenus.map((menu) => {
            const { discountPrice: _omitDiscountPrice, discounts, ...rest } = menu;
            const price = Number(menu.price);
            return {
                ...rest,
                price,
                hasActiveDiscount: discounts.length > 0,
                discountPreview: getMealDiscountPreview(
                    price,
                    discounts.map((d) => ({
                        percentage: Number(d.percentage),
                        minOrderSubtotal: Number(d.minOrderSubtotal),
                        maxDiscountAmount: Number(d.maxDiscountAmount),
                    }))
                ),
            };
        });

        return { success: true, data: serializedMenus };
    } catch (error) {
        console.error("Error fetching new shop menus:", error);
        return { success: false, error: "Failed to fetch new menus" };
    }
}
