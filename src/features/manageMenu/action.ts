'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { 
  Meal, 
  MealCategory, 
  MealImage, 
  MealOptionGroup, 
  MealOptionValue,
  Prisma 
} from '@/generated/prisma/client';

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

export interface SerializableMeal {
  id: string;
  shopId: string;
  name: string;
  description: string;
  price: number; // Changed from Decimal
  category: MealCategory;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  images: MealImage[];
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
  category: MealCategory;
  isAvailable: boolean;
  images: MealImageInput[];
  optionGroups: OptionGroupInput[];
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

// --- Actions ---

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
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        optionGroups: {
          include: {
            values: { orderBy: { price: 'asc' } }
          }, 
          orderBy: { createdAt: 'asc' } // Or add an order field to group later if needed
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Serialize Decimals to numbers
    const serializableMeals: SerializableMeal[] = meals.map(meal => ({
      ...meal,
      price: Number(meal.price),
      optionGroups: meal.optionGroups.map(group => ({
        ...group,
        values: group.values.map(val => ({
          ...val,
          price: Number(val.price)
        }))
      }))
    }));

    return { success: true, data: serializableMeals };
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

    // Transaction to ensure atomic creation
    const meal = await prisma.$transaction(async (tx) => {
      // 1. Create Meal
      const newMeal = await tx.meal.create({
        data: {
          shopId,
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          isAvailable: data.isAvailable,
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
          include: {
              images: { orderBy: { order: 'asc' } },
              optionGroups: {
                  include: { values: { orderBy: { price: 'asc' } } },
                  orderBy: { createdAt: 'asc' }
              }
          }
      });
      
      return fullMeal!;
    });

    revalidatePath('/manageMenu');

    // Serialize
    const serializableMeal: SerializableMeal = {
        ...meal,
        price: Number(meal.price),
        optionGroups: meal.optionGroups.map(g => ({
            ...g,
            values: g.values.map(v => ({
                ...v,
                price: Number(v.price)
            }))
        }))
    };

    return { success: true, data: serializableMeal };
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

    const updatedMeal = await prisma.$transaction(async (tx) => {
      // 1. Update basic fields
      await tx.meal.update({
        where: { id: data.id },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          isAvailable: data.isAvailable,
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
        include: {
            images: { orderBy: { order: 'asc' } },
            optionGroups: {
                include: { values: { orderBy: { price: 'asc' } } },
                orderBy: { createdAt: 'asc' }
            }
        }
      });
      return fullMeal!;
    });

    revalidatePath('/manageMenu');

    // Serialize
    const serializableMeal: SerializableMeal = {
        ...updatedMeal,
        price: Number(updatedMeal.price),
        optionGroups: updatedMeal.optionGroups.map(g => ({
            ...g,
            values: g.values.map(v => ({
                ...v,
                price: Number(v.price)
            }))
        }))
    };

    return { success: true, data: serializableMeal };
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
        include: {
            images: { orderBy: { order: 'asc' } },
            optionGroups: {
                include: { values: { orderBy: { price: 'asc' } } },
                orderBy: { createdAt: 'asc' }
            }
        }
    });

    revalidatePath('/manageMenu');

    // Serialize
    const serializableMeal: SerializableMeal = {
        ...updated,
        price: Number(updated.price),
        optionGroups: updated.optionGroups.map(g => ({
            ...g,
            values: g.values.map(v => ({
                ...v,
                price: Number(v.price)
            }))
        }))
    };

    return { success: true, data: serializableMeal };
  } catch (error) {
    console.error('Error toggling meal:', error);
    return { success: false, error: 'Failed to toggle availability' };
  } 
}
