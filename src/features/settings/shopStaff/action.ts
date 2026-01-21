'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getShopStaff() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // Find the shop where the current user is an OWNER
  const ownedShop = await prisma.userShopRole.findFirst({
    where: {
      userId: session.user.id,
      role: 'OWNER',
    },
    include: {
      shop: true,
    },
  });

  if (!ownedShop) {
    return { error: 'You do not own a shop.' };
  }

  // Get all staff for this shop
  const staff = await prisma.userShopRole.findMany({
    where: {
      shopId: ownedShop.shopId,
      // We might want to see all roles including other owners if multiple owners were allowed, 
      // but usually we just want to see STAFF or everyone. 
      // Let's return everyone but we can filter in UI if needed.
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return { success: true, data: staff };
}

export async function addShopStaff(email: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Unauthorized' };
  }

  if (!email) {
      return { error: 'Email is required' };
  }

  try {
      const ownedShop = await prisma.userShopRole.findFirst({
        where: {
          userId: session.user.id,
          role: 'OWNER',
        },
      });
    
      if (!ownedShop) {
        return { error: 'You do not own a shop.' };
      }

      const targetUser = await prisma.user.findUnique({
          where: { email }
      });

      if (!targetUser) {
          return { error: 'User not found with this email.' };
      }

      // Check if already in shop
      const existingRole = await prisma.userShopRole.findUnique({
          where: {
              shopId_userId: {
                  shopId: ownedShop.shopId,
                  userId: targetUser.id
              }
          }
      });

      if (existingRole) {
          return { error: 'User is already a member of this shop.' };
      }

      await prisma.userShopRole.create({
          data: {
              shopId: ownedShop.shopId,
              userId: targetUser.id,
              role: 'STAFF',
              getNotification: true // Default to true
          }
      });

      revalidatePath('/settings/shopStaff');
      return { success: true, message: 'Staff added successfully.' };

  } catch (error) {
      console.error('Error adding staff:', error);
      return { error: 'Failed to add staff.' };
  }
}

export async function toggleStaffNotification(userShopRoleId: string, getNotification: boolean) {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    try {
        const ownedShop = await prisma.userShopRole.findFirst({
            where: {
              userId: session.user.id,
              role: 'OWNER',
            },
        });
        
        if (!ownedShop) {
            return { error: 'You do not own a shop.' };
        }

        // Verify the role belongs to the shop owned by current user
        const targetRole = await prisma.userShopRole.findUnique({
            where: { id: userShopRoleId }
        });

        if (!targetRole || targetRole.shopId !== ownedShop.shopId) {
            return { error: 'Staff not found or not in your shop.' };
        }

        await prisma.userShopRole.update({
            where: { id: userShopRoleId },
            data: { getNotification }
        });

        revalidatePath('/settings/shopStaff');
        return { success: true };

    } catch (error) {
        console.error('Error toggling notification:', error);
        return { error: 'Failed to update notification settings.' };
    }
}

export async function removeShopStaff(userShopRoleId: string) {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: 'Unauthorized' };
    }

    try {
        const ownedShop = await prisma.userShopRole.findFirst({
            where: {
              userId: session.user.id,
              role: 'OWNER',
            },
        });
        
        if (!ownedShop) {
            return { error: 'You do not own a shop.' };
        }

        const targetRole = await prisma.userShopRole.findUnique({
            where: { id: userShopRoleId }
        });

        if (!targetRole || targetRole.shopId !== ownedShop.shopId) {
             return { error: 'Staff not found or not in your shop.' };
        }
        
        // Prevent removing yourself if you are an owner through this particular action logic 
        // (though UI should probably hide trash icon for self)
        if (targetRole.userId === session.user.id) {
            return { error: 'You cannot remove yourself.' };
        }

        await prisma.userShopRole.delete({
            where: { id: userShopRoleId }
        });

        revalidatePath('/settings/shopStaff');
        return { success: true };

    } catch (error) {
        console.error('Error removing staff:', error);
        return { error: 'Failed to remove staff.' };
    }
}
