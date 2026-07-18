'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type UserNavInfo = {
    isLoggedIn: boolean;
    hasShopRole: boolean; // OWNER or STAFF
    isShopOwner: boolean; // OWNER only (wallet access)
    lartCoinBalance: number;
};

export async function getUserNavInfo(): Promise<UserNavInfo> {
    const session = await auth();

    if (!session?.user?.id) {
        return { isLoggedIn: false, hasShopRole: false, isShopOwner: false, lartCoinBalance: 0 };
    }

    const [shopRoles, user] = await Promise.all([
        prisma.userShopRole.findMany({
            where: {
                userId: session.user.id,
                role: { in: ['OWNER', 'STAFF'] },
            },
            select: { role: true },
        }),
        prisma.user.findUnique({
            where: { id: session.user.id },
            select: { lartCoinBalance: true },
        }),
    ]);

    return {
        isLoggedIn: true,
        hasShopRole: shopRoles.length > 0,
        isShopOwner: shopRoles.some((r) => r.role === 'OWNER'),
        lartCoinBalance: user?.lartCoinBalance ?? 0,
    };
}
