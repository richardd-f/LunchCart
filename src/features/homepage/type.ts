import { Meal, MealImage, Shop } from "@/generated/prisma/client";


export interface ShopWithMeals extends Shop{
    meals: MealWithImages[];
}

export interface MealWithImages extends Meal{
    images: MealImage[];
}