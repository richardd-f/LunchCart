'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getOrCreateLartCoinConfig } from './coins';

export type LartCoinConfigData = {
    purchaseAmountPerCoin: number;
    coinValueRupiah: number;
};

export async function getLartCoinConfig(): Promise<LartCoinConfigData> {
    const config = await prisma.$transaction((tx) => getOrCreateLartCoinConfig(tx));
    return {
        purchaseAmountPerCoin: config.purchaseAmountPerCoin,
        coinValueRupiah: config.coinValueRupiah,
    };
}

export type LartCoinConfigState = {
    message?: string;
    error?: string;
};

export async function updateLartCoinConfig(
    prevState: LartCoinConfigState,
    formData: FormData
): Promise<LartCoinConfigState> {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
        return { error: 'Unauthorized' };
    }

    const purchaseAmountPerCoin = parseInt(formData.get('purchaseAmountPerCoin') as string) || 0;
    const coinValueRupiah = parseInt(formData.get('coinValueRupiah') as string) || 0;

    if (purchaseAmountPerCoin < 1 || coinValueRupiah < 1) {
        return { error: 'Both rates must be at least 1.' };
    }

    try {
        await prisma.lartCoinConfig.upsert({
            where: { id: 'singleton' },
            update: { purchaseAmountPerCoin, coinValueRupiah },
            create: { id: 'singleton', purchaseAmountPerCoin, coinValueRupiah },
        });
        revalidatePath('/dashboard/admin/lartCoin');
        return { message: 'Lart Coin rates updated' };
    } catch (error) {
        console.error('Failed to update Lart Coin config:', error);
        return { error: 'Failed to update Lart Coin rates' };
    }
}

export type LartCoinBalanceData = {
    balance: number;
    transactions: {
        id: string;
        type: 'EARN' | 'SPEND' | 'ADJUST';
        coins: number;
        description: string | null;
        createdAt: Date;
    }[];
};

export async function getMyLartCoinBalance(): Promise<LartCoinBalanceData | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            lartCoinBalance: true,
            lartCoinTransactions: {
                orderBy: { createdAt: 'desc' },
                take: 20,
                select: { id: true, type: true, coins: true, description: true, createdAt: true },
            },
        },
    });
    if (!user) return null;

    return {
        balance: user.lartCoinBalance,
        transactions: user.lartCoinTransactions,
    };
}
