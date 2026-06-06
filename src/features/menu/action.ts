"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Meal, MealCategory, MealOptionValue } from '@prisma/client'

// -- Types --
export interface AddToCartInput {
    mealId: string
    quantity: number
    notes?: string
    optionValueIds: string[]
}

export interface MealWithDetails {
    id: string
    shopId: string
    name: string
    description: string
    price: number
    hasActiveDiscount: boolean
    // category: "MEAL" | "SNACK" | "DRINK" | "DESSERT" | "TOOL" | "SAUCE"
    category: MealCategory
    isAvailable: boolean
    allowNotes: boolean
    createdAt: Date
    updatedAt: Date
    images: { id: string, imagePath: string, isPrimary: boolean }[]
    shop: { id: string, name: string, profileImage: string | null }
    optionGroups: {
        id: string
        name: string
        isMultiple: boolean
        isRequired: boolean
        values: {
            id: string
            mealOptionGroupId: string
            name: string
            price: number
            createdAt: Date
            updatedAt: Date
        }[]
    }[]
    orderItems: {
        id: string
        reviewMsg: string | null
        rate: number | null
        order: {
            user: {
                name: string
                image: string | null
            }
        }
        createdAt: Date
    }[]
    _count: {
        orderItems: number
    }
}

/**
 * Fetches meal details including relationships needed for the details page.
 */
export async function getMealDetails(mealId: string): Promise<MealWithDetails | null> {
    const meal = await prisma.meal.findUnique({
        where: { id: mealId },
        include: {
            images: {
                orderBy: { order: 'asc' }
            },
            discounts: { where: { isActive: true }, select: { id: true }, take: 1 },
            shop: {
                select: {
                    id: true,
                    name: true,
                    profileImage: true
                }
            },
            optionGroups: {
                include: {
                    values: true
                }
            },
            orderItems: {
                where: {
                    reviewMsg: { not: null },
                    rate: { not: null }
                },
                orderBy: { createdAt: 'desc' },
                take: 1,
                select: {
                    id: true,
                    reviewMsg: true,
                    rate: true,
                    createdAt: true,
                    order: {
                        select: {
                            user: {
                                select: {
                                    name: true,
                                    image: true
                                }
                            }
                        }
                    }
                }
            },
            _count: {
                select: { orderItems: true }
            }
        }
    })

    if (!meal) return null

    // Manually map to plain object to handle Decimal -> Number conversion
    const { discountPrice: _omitDiscountPrice, discounts, ...rest } = meal;
    return {
        ...rest,
        price: Number(meal.price),
        hasActiveDiscount: discounts.length > 0,
        allowNotes: meal.allowNotes,
        category: meal.category as "MEAL" | "SNACK" | "DRINK" | "DESSERT" | "TOOL" | "SAUCE",
        optionGroups: meal.optionGroups.map(group => ({
            ...group,
            values: group.values.map(val => ({
                ...val,
                price: Number(val.price)
            }))
        }))
    }
}

/**
 * Adds a meal to the user's cart.
 */
export async function addToCart(data: AddToCartInput) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // 1. Create the CartItem
    const cartItem = await prisma.cartItem.create({
        data: {
            userId: session.user.id,
            mealId: data.mealId,
            quantity: data.quantity,
            notes: data.notes,
        }
    })

    // 2. Link Options if any
    if (data.optionValueIds && data.optionValueIds.length > 0) {
        await prisma.cartItemOption.createMany({
            data: data.optionValueIds.map(optId => ({
                cartItemId: cartItem.id,
                mealOptionValueId: optId
            }))
        })
    }
    
    revalidatePath('/cart') 
    // We might not have a cart page path yet defined in this chat, but it's good practice.
    
    return { success: true, message: "Added to cart" }
}
