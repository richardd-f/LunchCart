'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getIsShopOwner() {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const ownedShop = await prisma.userShopRole.findFirst({
    where: {
      userId: session.user.id,
      role: 'OWNER',
    },
    select: { id: true }
  });

  return !!ownedShop;
}
