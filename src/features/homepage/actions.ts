'use server';

import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/types/ActionResult";
import { ShopWithMeals } from "./type";

export async function getHomepageData(): Promise<ActionResult<ShopWithMeals[]>> {
  try {
    const shops = await prisma.shop.findMany({
      where: {
        status: 'OPEN',
        meals: {
          some: {
            isAvailable: true,
          }
        }
      },
      include:{
        meals:{
          where:{
            isAvailable: true,
          },
          include:{
            images:{
              where:{
                isPrimary: true,
              }
            }
          },
          take: 10,
        }
      },
      take: 20,
    });

    return {
      success: true,
      data: shops,
    };
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch homepage data',
    };
  }
}
