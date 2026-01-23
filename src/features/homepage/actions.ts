'use server';

import { prisma } from "@/lib/prisma";
import { ActionResult } from "@/types/ActionResult";
import { ShopWithMeals } from "./type";

export async function getHomepageData(searchQuery?: string): Promise<ActionResult<ShopWithMeals[]>> {
  try {
    const query = searchQuery?.trim().toLowerCase();

    const shops = await prisma.shop.findMany({
      where: {
        status: 'OPEN',
        meals: {
          some: {
            isAvailable: true,
            ...(query ? { name: { contains: query, mode: 'insensitive' } } : {}),
          }
        }
      },
      include:{
        meals:{
          where:{
            isAvailable: true,
            ...(query ? { name: { contains: query, mode: 'insensitive' } } : {}),
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
