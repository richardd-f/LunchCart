'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// --- Serializable types (Prisma Decimal -> number) ---

export interface SerializableDiscountMeal {
  id: string;
  name: string;
}

export interface SerializableDiscount {
  id: string;
  shopId: string;
  name: string;
  percentage: number;
  minOrderSubtotal: number;
  maxDiscountAmount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  meals: SerializableDiscountMeal[];
}

// --- Input types ---

export type CreateDiscountInput = {
  name: string;
  percentage: number;
  minOrderSubtotal: number;
  maxDiscountAmount: number;
  isActive: boolean;
  mealIds: string[];
};

export type UpdateDiscountInput = Partial<CreateDiscountInput> & {
  id: string;
};

const REVALIDATE_PATH = '/dashboard/shop/manageDiscounts';

// --- Helpers ---

async function getOwnerShopId(userId: string): Promise<string | null> {
  const role = await prisma.userShopRole.findFirst({
    where: {
      userId,
      role: { in: ['OWNER', 'STAFF'] },
    },
    select: { shopId: true },
  });
  return role?.shopId || null;
}

type DiscountWithMeals = {
  id: string;
  shopId: string;
  name: string;
  percentage: unknown;
  minOrderSubtotal: unknown;
  maxDiscountAmount: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  meals: { id: string; name: string }[];
};

function serializeDiscount(discount: DiscountWithMeals): SerializableDiscount {
  return {
    id: discount.id,
    shopId: discount.shopId,
    name: discount.name,
    percentage: Number(discount.percentage),
    minOrderSubtotal: Number(discount.minOrderSubtotal),
    maxDiscountAmount: Number(discount.maxDiscountAmount),
    isActive: discount.isActive,
    createdAt: discount.createdAt,
    updatedAt: discount.updatedAt,
    meals: discount.meals.map((m) => ({ id: m.id, name: m.name })),
  };
}

// Only allow attaching meals that belong to this shop.
async function filterShopMealIds(shopId: string, mealIds: string[]): Promise<string[]> {
  if (!mealIds || mealIds.length === 0) return [];
  const meals = await prisma.meal.findMany({
    where: { id: { in: mealIds }, shopId },
    select: { id: true },
  });
  return meals.map((m) => m.id);
}

// --- Actions ---

export async function getDiscounts(): Promise<ActionResult<SerializableDiscount[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    const discounts = await prisma.discount.findMany({
      where: { shopId },
      include: {
        meals: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: discounts.map(serializeDiscount) };
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return { success: false, error: 'Failed to fetch discounts' };
  }
}

// Lightweight list of the shop's meals for the attach multi-select.
export async function getShopMealsForSelect(): Promise<ActionResult<SerializableDiscountMeal[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    const meals = await prisma.meal.findMany({
      where: { shopId },
      select: { id: true, name: true },
      orderBy: [{ orderNumber: 'asc' }, { createdAt: 'asc' }],
    });

    return { success: true, data: meals };
  } catch (error) {
    console.error('Error fetching shop meals:', error);
    return { success: false, error: 'Failed to fetch shop meals' };
  }
}

export async function createDiscount(
  data: CreateDiscountInput
): Promise<ActionResult<SerializableDiscount>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    const mealIds = await filterShopMealIds(shopId, data.mealIds);

    const discount = await prisma.discount.create({
      data: {
        shopId,
        name: data.name,
        percentage: data.percentage,
        minOrderSubtotal: data.minOrderSubtotal,
        maxDiscountAmount: data.maxDiscountAmount,
        isActive: data.isActive,
        meals: { connect: mealIds.map((id) => ({ id })) },
      },
      include: {
        meals: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true, data: serializeDiscount(discount) };
  } catch (error) {
    console.error('Error creating discount:', error);
    return { success: false, error: 'Failed to create discount' };
  }
}

export async function updateDiscount(
  data: UpdateDiscountInput
): Promise<ActionResult<SerializableDiscount>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    const existing = await prisma.discount.findUnique({ where: { id: data.id } });
    if (!existing || existing.shopId !== shopId) {
      return { success: false, error: 'Discount not found or unauthorized' };
    }

    const discount = await prisma.discount.update({
      where: { id: data.id },
      data: {
        name: data.name,
        percentage: data.percentage,
        minOrderSubtotal: data.minOrderSubtotal,
        maxDiscountAmount: data.maxDiscountAmount,
        isActive: data.isActive,
        ...(data.mealIds !== undefined
          ? { meals: { set: (await filterShopMealIds(shopId, data.mealIds)).map((id) => ({ id })) } }
          : {}),
      },
      include: {
        meals: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true, data: serializeDiscount(discount) };
  } catch (error) {
    console.error('Error updating discount:', error);
    return { success: false, error: 'Failed to update discount' };
  }
}

export async function deleteDiscount(id: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    const existing = await prisma.discount.findUnique({ where: { id } });
    if (!existing || existing.shopId !== shopId) {
      return { success: false, error: 'Discount not found or unauthorized' };
    }

    await prisma.discount.delete({ where: { id } });
    revalidatePath(REVALIDATE_PATH);
    return { success: true };
  } catch (error) {
    console.error('Error deleting discount:', error);
    return { success: false, error: 'Failed to delete discount' };
  }
}

export async function toggleDiscountActive(
  id: string
): Promise<ActionResult<SerializableDiscount>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    const existing = await prisma.discount.findUnique({ where: { id } });
    if (!existing || existing.shopId !== shopId) {
      return { success: false, error: 'Discount not found or unauthorized' };
    }

    const discount = await prisma.discount.update({
      where: { id },
      data: { isActive: !existing.isActive },
      include: {
        meals: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
      },
    });

    revalidatePath(REVALIDATE_PATH);
    return { success: true, data: serializeDiscount(discount) };
  } catch (error) {
    console.error('Error toggling discount:', error);
    return { success: false, error: 'Failed to toggle discount' };
  }
}
