'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type UserNavInfo = {
    isLoggedIn: boolean;
    hasShopRole: boolean; // OWNER or STAFF
};

export async function getUserNavInfo(): Promise<UserNavInfo> {
    const session = await auth();
    
    if (!session?.user?.id) {
        return { isLoggedIn: false, hasShopRole: false };
    }

    const shopRole = await prisma.userShopRole.findFirst({
        where: {
            userId: session.user.id,
            role: { in: ['OWNER', 'STAFF'] },
        },
    });

    return {
        isLoggedIn: true,
        hasShopRole: !!shopRole,
    };
}
