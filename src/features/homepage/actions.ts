'use server';

import { prisma } from "@/lib/prisma";

export async function getHomepageData() {
  const shops = await prisma.shop.findMany({
    where: {
      status: 'OPEN', // Assuming we only want open shops, or remove if not needed yet
      meals: {
        some: {
          isAvailable: true,
        }
      }
    },
    select: {
      id: true,
      name: true,
      address: true,
      profileImage: true,
      meals: {
        where: {
          isAvailable: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
          images: {
            where: { isPrimary: true },
            select: { imagePath: true },
            take: 1,
          },
        },
        take: 10, // Limit meals per shop for homepage performance
      },
    },
    take: 20, // Limit total shops
  });

  return shops;
}
