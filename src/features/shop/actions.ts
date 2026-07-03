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

// Shared shape returned by the meal queries below (Decimal price + discounts included).
type ShopMenuPayload = {
  discountPrice: unknown;
  price: unknown;
  discounts: {
    id: string;
    percentage: unknown;
    minOrderSubtotal: unknown;
    maxDiscountAmount: unknown;
  }[];
} & Record<string, unknown>;

// Convert Decimal to number for serialization and compute the discount preview.
function serializeShopMenu(menu: ShopMenuPayload): ShopMenuWithImages {
  const { discountPrice: _omitDiscountPrice, discounts, ...rest } = menu;
  const price = Number(menu.price);
  return {
    ...(rest as unknown as Omit<ShopMenuWithImages, 'price' | 'hasActiveDiscount' | 'discountPreview'>),
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
}

export type ShopMenuPage = {
  menus: ShopMenuWithImages[];
  hasMore: boolean;
};

export async function getShopMenusPage(
  shopId: string,
  options?: { category?: MealCategory; offset?: number; take?: number }
): Promise<ActionResult<ShopMenuPage>> {
  try {
    const category = options?.category;
    const offset = Math.max(0, options?.offset ?? 0);
    const take = Math.min(Math.max(1, options?.take ?? 8), 24);

    // Resolve "today" in the shop's timezone for the discount day-schedule.
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { timezone: true },
    });
    const today = getTodayName(shop?.timezone ?? 'Asia/Jakarta');

    // Fetch one extra row: if it exists there is at least one more page.
    const rows = await prisma.meal.findMany({
      where: {
        shopId,
        isAvailable: true,
        ...(category ? { category } : {}),
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
      orderBy: [
        { orderNumber: 'asc' },
        { createdAt: 'asc' }
      ],
      skip: offset,
      take: take + 1,
    });

    const hasMore = rows.length > take;
    const menus = rows.slice(0, take).map(serializeShopMenu);

    return { success: true, data: { menus, hasMore } };
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

        return { success: true, data: newMenus.map(serializeShopMenu) };
    } catch (error) {
        console.error("Error fetching new shop menus:", error);
        return { success: false, error: "Failed to fetch new menus" };
    }
}
