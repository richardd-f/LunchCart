'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { sendWhatsApp } from '@/lib/gowa';

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
      orderCutoffMinutes: true,
      dailyOrderLimit: true,
      showNewMenuSection: true,
      isUsingTimePickup: true,
      pickupTimes: true,
      pickupLabels: true,
      orderSchedules: true,
      orderScheduleMode: true,
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

    // Send WhatsApp notification to all admins
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', phone: { not: null } },
        select: { phone: true },
      });

      const ownerName = session.user.name || 'Unknown';
      const message = `🆕 *Permintaan Toko Baru*

📋 *Detail Toko:*
👤 Pemilik: ${ownerName}
🏪 Nama Toko: ${name}
📞 Telepon: ${phone}
📍 Alamat: ${address}

Silakan review di panel admin.`;

      // Send to all admins (fire and forget - don't block on failure)
      for (const admin of admins) {
        if (admin.phone) {
          sendWhatsApp(admin.phone, message).catch((err) => {
            console.error('Failed to send WhatsApp to admin:', err);
          });
        }
      }
    } catch (notifError) {
      // Log but don't fail the request if notification fails
      console.error('Failed to send admin notification:', notifError);
    }

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
  const orderCutoffMinutes = parseInt(formData.get('orderCutoffMinutes') as string) || 0;
  const dailyOrderLimit = parseInt(formData.get('dailyOrderLimit') as string) || 0;
  const showNewMenuSection = formData.get('showNewMenuSection') === 'true';
  const isUsingTimePickup = formData.get('isUsingTimePickup') === 'true';
  const pickupTimes = formData.getAll('pickupTimes') as string[];

  // Pickup labels arrive as a JSON array of { label, isLiveQueue }
  const pickupLabelsJson = formData.get('pickupLabelsData') as string;
  let pickupLabels: { label: string; isLiveQueue: boolean }[] = [];
  if (pickupLabelsJson) {
    try {
      pickupLabels = JSON.parse(pickupLabelsJson);
    } catch (e) {
      console.error('Failed to parse pickup labels JSON', e);
    }
  }
  // Drop empty labels so blank rows are not persisted
  pickupLabels = pickupLabels.filter((pl) => pl.label.trim().length > 0);

  // Order Schedule
  const orderScheduleMode = (formData.get('orderScheduleMode') as 'OFF' | 'ON') || 'OFF';
  const orderSchedulesJson = formData.get('orderSchedules') as string;
  let orderSchedules: { day: string; startTime: string; endTime: string }[] = [];

  if (orderSchedulesJson) {
      try {
          orderSchedules = JSON.parse(orderSchedulesJson);
      } catch (e) {
          console.error('Failed to parse order schedules JSON', e);
      }
  }

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
                orderCutoffMinutes,
                dailyOrderLimit,
                showNewMenuSection,
                isUsingTimePickup,
                orderScheduleMode,
            },
        });

        // Update pickup times: delete existing and create new ones
        await tx.pickupTime.deleteMany({
            where: { shopId: shopId },
        });

        if (fixedTimePickup && isUsingTimePickup && pickupTimes.length > 0) {
            await tx.pickupTime.createMany({
                data: pickupTimes.map(time => ({
                    shopId: shopId,
                    time,
                }))
            });
        }

        // Update pickup labels: delete existing and create new ones
        await tx.pickupLabel.deleteMany({
             where: { shopId: shopId },
        });

        if (!isUsingTimePickup && pickupLabels.length > 0) {
             await tx.pickupLabel.createMany({
                 data: pickupLabels.map(pl => ({
                     shopId: shopId,
                     label: pl.label.trim(),
                     isLiveQueue: pl.isLiveQueue,
                 }))
             });
        }

        // Update Order Schedules
        await tx.orderSchedule.deleteMany({
            where: { shopId: shopId },
        });

        if (orderSchedules.length > 0) {
            await tx.orderSchedule.createMany({
                data: orderSchedules.map(schedule => ({
                    shopId: shopId,
                    day: schedule.day,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
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
