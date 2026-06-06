import { Meal, MealImage, Shop } from "@prisma/client";


export interface ShopWithMeals extends Shop{
    meals: MealWithImages[];
}

export interface MealWithImages extends Meal{
    images: MealImage[];
    discounts: { id: string }[];
}