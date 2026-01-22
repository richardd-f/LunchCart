'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getShopProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Find the shop where the user is an owner or staff
  const shop = await prisma.shop.findFirst({
    where: {
      userRoles: {
        some: {
          userId: session.user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      profileImage: true,
      description: true,
      status: true,
      fixedTimePickup: true,
      pickupTimes: true,
    },
  });

  return shop;
}

export type ShopProfileState = {
  message?: string;
  error?: string;
};

export async function createShop(
  prevState: ShopProfileState,
  formData: FormData
): Promise<ShopProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const phone = formData.get('phone') as string;
  const description = formData.get('description') as string;
  const profileImage = formData.get('profileImage') as string;
  const fixedTimePickup = formData.get('fixedTimePickup') === 'true';
  const pickupTimes = formData.getAll('pickupTimes') as string[];

  if (!name || !address || !phone) {
    return { error: 'Please fill in all required fields (Name, Address, Phone)' };
  }

  if (fixedTimePickup && pickupTimes.length === 0) {
     return { error: 'Please provide at least one pickup time for Fixed Time mode.' };
  }

  try {
    // Transaction to create shop and assign owner role
    await prisma.$transaction(async (tx) => {
      const shop = await tx.shop.create({
        data: {
          name,
          address,
          phone,
          description: description || '',
          profileImage: profileImage || null,
          status: 'PENDING',
          fixedTimePickup,
        },
      });

      if (fixedTimePickup && pickupTimes.length > 0) {
          await tx.pickupTime.createMany({
              data: pickupTimes.map(time => ({
                  shopId: shop.id,
                  time,
              }))
          })
      }

      await tx.userShopRole.create({
        data: {
          userId: session.user.id,
          shopId: shop.id,
          role: 'OWNER',
        },
      });
    });

    revalidatePath('/settings/shop');
    return { message: 'Shop request submitted successfully' };
  } catch (error) {
    console.error('Failed to create shop:', error);
    return { error: 'Failed to create shop. Name might already be taken.' };
  }
}

export async function updateShopProfile(
  prevState: ShopProfileState,
  formData: FormData
): Promise<ShopProfileState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  const shopId = formData.get('shopId') as string;
  const name = formData.get('name') as string;
  const address = formData.get('address') as string;
  const phone = formData.get('phone') as string;
  const description = formData.get('description') as string;
  const profileImage = formData.get('profileImage') as string;

  const fixedTimePickup = formData.get('fixedTimePickup') === 'true';
  const pickupTimes = formData.getAll('pickupTimes') as string[];

  if (!shopId) {
    return { error: 'Shop ID is missing' };
  }

  if (fixedTimePickup && pickupTimes.length === 0) {
     return { error: 'Please provide at least one pickup time for Fixed Time mode.' };
  }

  // Verify ownership
  const isOwner = await prisma.userShopRole.findUnique({
    where: {
      shopId_userId: {
        shopId: shopId,
        userId: session.user.id,
      },
    },
  });

  if (!isOwner || isOwner.role !== 'OWNER') {
    return { error: 'Unauthorized to update this shop' };
  }

  try {
    await prisma.$transaction(async (tx) => {
        await tx.shop.update({
            where: { id: shopId },
            data: {
                name,
                address,
                phone,
                description,
                profileImage: profileImage || null,
                fixedTimePickup,
            },
        });

        // Update pickup times: delete existing and create new ones
        await tx.pickupTime.deleteMany({
            where: { shopId: shopId },
        });

        if (fixedTimePickup && pickupTimes.length > 0) {
            await tx.pickupTime.createMany({
                data: pickupTimes.map(time => ({
                    shopId: shopId,
                    time,
                }))
            });
        }
    });

    revalidatePath('/settings/shop');
    return { message: 'Shop profile updated successfully' };
  } catch (error) {
    console.error('Failed to update shop profile:', error);
    return { error: 'Failed to update shop profile' };
  }
}
