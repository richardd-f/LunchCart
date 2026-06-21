import { Meal, MealImage, Shop, Prisma } from "@prisma/client";


export interface ShopWithMeals extends Shop{
    meals: MealWithImages[];
}

export interface MealWithImages extends Meal{
    images: MealImage[];
    discounts: {
        id: string;
        percentage: Prisma.Decimal;
        minOrderSubtotal: Prisma.Decimal;
        maxDiscountAmount: Prisma.Decimal;
    }[];
}