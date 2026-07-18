'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MealCategory, MealImage, Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Define serializable types
export interface SerializableMealOptionValue {
  id: string;
  mealOptionGroupId: string;
  name: string;
  price: number; // Changed from Decimal
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializableMealOptionGroup {
  id: string;
  mealId: string;
  name: string;
  isMultiple: boolean;
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
  values: SerializableMealOptionValue[];
}

export interface SerializableMealDiscount {
  id: string;
  name: string;
}

// Option shown in the menu modal's discount selector.
export type ShopDiscountOption = {
  id: string;
  name: string;
  percentage: number;
  isActive: boolean;
};

export interface SerializableMeal {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number; // Changed from Decimal
  isCoinMenu: boolean;
  coinPrice: number;
  category: MealCategory;
  isAvailable: boolean;
  orderNumber: number;
  allowNotes: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: MealImage[];
  discounts: SerializableMealDiscount[];
  optionGroups: SerializableMealOptionGroup[];
}

export type MealWithRelations = SerializableMeal;

// --- Input Types ---

export type OptionValueInput = {
  id?: string; // If present, update. If missing, create.
  name: string;
  price: number;
};

export type OptionGroupInput = {
  id?: string;
  name: string;
  isMultiple: boolean;
  isRequired: boolean;
  values: OptionValueInput[];
};

export type MealImageInput = {
  imagePath: string;
  isPrimary: boolean;
  order: number;
};

export type CreateMealInput = {
  name: string;
  description: string;
  price: number;
  isCoinMenu: boolean;
  coinPrice: number;
  category: MealCategory;
  isAvailable: boolean;
  allowNotes: boolean;
  images: MealImageInput[];
  optionGroups: OptionGroupInput[];
  discountIds: string[];
};

export type UpdateMealInput = Partial<CreateMealInput> & {
  id: string;
};

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

// Only allow attaching discounts that belong to this shop.
async function filterShopDiscountIds(shopId: string, discountIds: string[]): Promise<string[]> {
  if (!discountIds || discountIds.length === 0) return [];
  const discounts = await prisma.discount.findMany({
    where: { id: { in: discountIds }, shopId },
    select: { id: true },
  });
  return discounts.map((d) => d.id);
}

// Shared shape + serializer so every action returns identical meal data.
const mealInclude = {
  images: { orderBy: { order: 'asc' } },
  optionGroups: {
    include: { values: { orderBy: { price: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  },
  discounts: { select: { id: true, name: true }, orderBy: { name: 'asc' } },
} satisfies Prisma.MealInclude;

type MealPayload = Prisma.MealGetPayload<{ include: typeof mealInclude }>;

function serializeMeal(meal: MealPayload): SerializableMeal {
  return {
    id: meal.id,
    shopId: meal.shopId,
    name: meal.name,
    description: meal.description,
    price: Number(meal.price),
    isCoinMenu: meal.isCoinMenu,
    coinPrice: meal.coinPrice,
    category: meal.category,
    isAvailable: meal.isAvailable,
    orderNumber: meal.orderNumber,
    allowNotes: meal.allowNotes,
    createdAt: meal.createdAt,
    updatedAt: meal.updatedAt,
    images: meal.images,
    discounts: meal.discounts.map((d) => ({ id: d.id, name: d.name })),
    optionGroups: meal.optionGroups.map((group) => ({
      ...group,
      values: group.values.map((val) => ({ ...val, price: Number(val.price) })),
    })),
  };
}

// --- Actions ---

// Lightweight list of the shop's discounts for the menu modal's selector.
export async function getShopDiscountsForSelect(): Promise<ActionResult<ShopDiscountOption[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    const discounts = await prisma.discount.findMany({
      where: { shopId },
      select: { id: true, name: true, percentage: true, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: discounts.map((d) => ({
        id: d.id,
        name: d.name,
        percentage: Number(d.percentage),
        isActive: d.isActive,
      })),
    };
  } catch (error) {
    console.error('Error fetching shop discounts:', error);
    return { success: false, error: 'Failed to fetch shop discounts' };
  }
}

export async function getMeals(
  search?: string
): Promise<ActionResult<MealWithRelations[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    const where: Prisma.MealWhereInput = {
      shopId,
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      } : {})
    };

    const meals = await prisma.meal.findMany({
      where,
      include: mealInclude,
      orderBy: [
        { orderNumber: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return { success: true, data: meals.map(serializeMeal) };
  } catch (error) {
    console.error('Error fetching meals:', error);
    return { success: false, error: 'Failed to fetch meals' };
  }
}

export async function createMeal(data: CreateMealInput): Promise<ActionResult<SerializableMeal>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    // Coin menus: integer coin price, no Rupiah price, no discounts, no options.
    const isCoinMenu = data.isCoinMenu ?? false;
    const coinPrice = Math.max(0, Math.floor(data.coinPrice ?? 0));
    if (isCoinMenu && coinPrice < 1) {
      return { success: false, error: 'Coin price must be at least 1 Lart Coin' };
    }
    if (isCoinMenu) {
      data = { ...data, price: 0, discountIds: [], optionGroups: [] };
    }

    const discountIds = await filterShopDiscountIds(shopId, data.discountIds);

    // Transaction to ensure atomic creation
    const meal = await prisma.$transaction(async (tx) => {
      // 1. Create Meal
      const newMeal = await tx.meal.create({
        data: {
          shopId,
          name: data.name,
          description: data.description,
          price: data.price,
          isCoinMenu,
          coinPrice: isCoinMenu ? coinPrice : 0,
          category: data.category,
          isAvailable: data.isAvailable,
          allowNotes: data.allowNotes,
          discounts: { connect: discountIds.map((id) => ({ id })) },
        }
      });

      // 2. Create Images
      if (data.images && data.images.length > 0) {
        await tx.mealImage.createMany({
          data: data.images.map(img => ({
            mealId: newMeal.id,
            imagePath: img.imagePath,
            isPrimary: img.isPrimary,
            order: img.order,
          }))
        });
      }

      // 3. Create Option Groups & Values
      if (data.optionGroups && data.optionGroups.length > 0) {
        for (const group of data.optionGroups) {
          const newGroup = await tx.mealOptionGroup.create({
            data: {
              mealId: newMeal.id,
              name: group.name,
              isMultiple: group.isMultiple,
              isRequired: group.isRequired,
            }
          });

          if (group.values && group.values.length > 0) {
            await tx.mealOptionValue.createMany({
              data: group.values.map(val => ({
                mealOptionGroupId: newGroup.id,
                name: val.name,
                price: val.price,
              }))
            });
          }
        }
      }

      // Fetch the full meal with relations to return
      const fullMeal = await tx.meal.findUnique({
          where: { id: newMeal.id },
          include: mealInclude,
      });

      return fullMeal!;
    });

    revalidatePath('/manageMenu');

    return { success: true, data: serializeMeal(meal) };
  } catch (error) {
    console.error('Error creating meal:', error);
    return { success: false, error: 'Failed to create meal' };
  }
}

export async function updateMeal(data: UpdateMealInput): Promise<ActionResult<SerializableMeal>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    const existingMeal = await prisma.meal.findUnique({ where: { id: data.id } });
    if (!existingMeal || existingMeal.shopId !== shopId) {
       return { success: false, error: 'Meal not found or unauthorized' };
    }

    // Coin menus: integer coin price, no Rupiah price, no discounts, no options.
    const isCoinMenu = data.isCoinMenu ?? existingMeal.isCoinMenu;
    const coinPrice = Math.max(0, Math.floor(data.coinPrice ?? existingMeal.coinPrice));
    if (isCoinMenu && coinPrice < 1) {
      return { success: false, error: 'Coin price must be at least 1 Lart Coin' };
    }
    if (isCoinMenu) {
      data = { ...data, price: 0, discountIds: [], optionGroups: [] };
    }

    const discountIds =
      data.discountIds !== undefined
        ? await filterShopDiscountIds(shopId, data.discountIds)
        : undefined;

    const updatedMeal = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      await tx.meal.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          isCoinMenu,
          coinPrice: isCoinMenu ? coinPrice : 0,
          category: data.category,
          isAvailable: data.isAvailable,
          allowNotes: data.allowNotes,
          ...(discountIds !== undefined
            ? { discounts: { set: discountIds.map((id) => ({ id })) } }
            : {}),
        }
      });

      // 2. Handle Images logic (Replace strategy for simplicity: Delete all, Add new)
      if (data.images) {
        await tx.mealImage.deleteMany({ where: { mealId: data.id } });
        if (data.images.length > 0) {
          await tx.mealImage.createMany({
            data: data.images.map(img => ({
              mealId: data.id,
              imagePath: img.imagePath,
              isPrimary: img.isPrimary,
              order: img.order,
            }))
          });
        }
      }

      // 3. Handle Option Groups logic (Replace strategy)
      if (data.optionGroups) {
          await tx.mealOptionGroup.deleteMany({ where: { mealId: data.id } });

          for (const group of data.optionGroups) {
            const newGroup = await tx.mealOptionGroup.create({
              data: {
                mealId: data.id,
                name: group.name,
                isMultiple: group.isMultiple,
                isRequired: group.isRequired,
              }
            });
  
            if (group.values && group.values.length > 0) {
              await tx.mealOptionValue.createMany({
                data: group.values.map(val => ({
                  mealOptionGroupId: newGroup.id,
                  name: val.name,
                  price: val.price,
                }))
              });
            }
          }
      }

      // Fetch full meal
      const fullMeal = await tx.meal.findUnique({
        where: { id: data.id },
        include: mealInclude,
      });
      return fullMeal!;
    });

    revalidatePath('/manageMenu');

    return { success: true, data: serializeMeal(updatedMeal) };
  } catch (error) {
    console.error('Error updating meal:', error);
    return { success: false, error: 'Failed to update meal' };
  }
}

export async function deleteMeal(id: string): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    const existingMeal = await prisma.meal.findUnique({ where: { id } });
    if (!existingMeal || existingMeal.shopId !== shopId) {
       return { success: false, error: 'Meal not found or unauthorized' };
    }

    await prisma.meal.delete({ where: { id } });
    revalidatePath('/manageMenu');
    return { success: true };
  } catch (error) {
    console.error('Error deleting meal:', error);
    return { success: false, error: 'Failed to delete meal' };
  }
}

export async function toggleMealAvailability(id: string): Promise<ActionResult<SerializableMeal>> {
     try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    const existingMeal = await prisma.meal.findUnique({ where: { id } });
    if (!existingMeal || existingMeal.shopId !== shopId) {
       return { success: false, error: 'Meal not found or unauthorized' };
    }

    const updated = await prisma.meal.update({
        where: { id },
        data: { isAvailable: !existingMeal.isAvailable },
        include: mealInclude,
    });

    revalidatePath('/manageMenu');

    return { success: true, data: serializeMeal(updated) };
  } catch (error) {
    console.error('Error toggling meal:', error);
    return { success: false, error: 'Failed to toggle availability' };
  } 
}

export type BulkPriceAdjustInput = {
  mealIds: string[];
  direction: 'increase' | 'decrease';
  amount: number; // positive rupiah amount applied to every selected meal
};

export async function bulkAdjustMealPrices(
  input: BulkPriceAdjustInput
): Promise<ActionResult<SerializableMeal[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    if (!input.mealIds || input.mealIds.length === 0) {
      return { success: false, error: 'Select at least one menu.' };
    }

    const amount = Math.round(input.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: 'Amount must be greater than 0.' };
    }

    const delta = input.direction === 'decrease' ? -amount : amount;

    // Validate and update atomically so a concurrent edit can't slip a price below the floor.
    const result = await prisma.$transaction(async (tx) => {
      const meals = await tx.meal.findMany({
        where: { id: { in: input.mealIds }, shopId },
        select: { id: true, name: true, price: true, isCoinMenu: true },
      });

      if (meals.length !== input.mealIds.length) {
        return { error: 'Some menus were not found or belong to another shop.' };
      }

      // Coin menus have no Rupiah price to adjust.
      const coinMenus = meals.filter((m) => m.isCoinMenu);
      if (coinMenus.length > 0) {
        const names = coinMenus.map((m) => m.name).join(', ');
        return {
          error: `Coin menus cannot be price-adjusted in Rupiah: ${names}. Nothing was changed.`,
        };
      }

      // Block the whole edit if any resulting price would be <= 0.
      const offending = meals.filter((m) => Number(m.price) + delta <= 0);
      if (offending.length > 0) {
        const names = offending.map((m) => m.name).join(', ');
        return {
          error: `This change would make the price Rp0 or below for: ${names}. Nothing was changed.`,
        };
      }

      await tx.meal.updateMany({
        where: { id: { in: input.mealIds }, shopId },
        data: { price: { increment: delta } },
      });

      const updated = await tx.meal.findMany({
        where: { id: { in: input.mealIds }, shopId },
        include: mealInclude,
      });
      return { updated };
    });

    if ('error' in result) {
      return { success: false, error: result.error };
    }

    revalidatePath('/manageMenu');

    return { success: true, data: result.updated!.map(serializeMeal) };
  } catch (error) {
    console.error('Error bulk adjusting meal prices:', error);
    return { success: false, error: 'Failed to update prices' };
  }
}

export async function updateMealOrder(
  mealOrders: { id: string; orderNumber: number }[]
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

    const shopId = await getOwnerShopId(session.user.id);
    if (!shopId) return { success: false, error: 'Shop not found' };

    // Verify all meals belong to the shop
    const mealIds = mealOrders.map(m => m.id);
    const meals = await prisma.meal.findMany({
      where: { id: { in: mealIds }, shopId },
      select: { id: true }
    });

    if (meals.length !== mealIds.length) {
      return { success: false, error: 'Some meals not found or unauthorized' };
    }

    // Update all meal orders in a transaction
    await prisma.$transaction(
      mealOrders.map(({ id, orderNumber }) =>
        prisma.meal.update({
          where: { id },
          data: { orderNumber }
        })
      )
    );

    revalidatePath('/manageMenu');
    revalidatePath('/shop');
    revalidatePath('/');

    return { success: true };
  } catch (error) {
    console.error('Error updating meal order:', error);
    return { success: false, error: 'Failed to update meal order' };
  }
}
