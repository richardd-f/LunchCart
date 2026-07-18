import { Prisma } from '@prisma/client';

/**
 * Lart Coin core rules.
 *
 * Earning: every `purchaseAmountPerCoin` Rupiah of a PAID (Rupiah) order earns
 * 1 coin (floor). Coin-paid orders never earn coins.
 * Spending/value: 1 coin is worth `coinValueRupiah` when spent on coin menus;
 * the shop is credited that Rupiah amount (rate locked at order creation).
 * Every balance change writes a ledger row, all inside the caller's transaction.
 */

type Tx = Prisma.TransactionClient;

export const LART_COIN_CONFIG_ID = 'singleton';

export async function getOrCreateLartCoinConfig(tx: Tx) {
    return tx.lartCoinConfig.upsert({
        where: { id: LART_COIN_CONFIG_ID },
        update: {},
        create: { id: LART_COIN_CONFIG_ID },
    });
}

/** Award coins for a Rupiah order that just became PAID. */
export async function awardCoinsForOrder(
    tx: Tx,
    order: { id: string; userId: string; totalAmount: number }
): Promise<number> {
    const config = await getOrCreateLartCoinConfig(tx);
    const coins = Math.floor(order.totalAmount / config.purchaseAmountPerCoin);
    if (coins <= 0) return 0;

    await tx.lartCoinTransaction.create({
        data: {
            userId: order.userId,
            orderId: order.id,
            type: 'EARN',
            coins,
            description: `Earned from order #${order.id.slice(-6).toUpperCase()}`,
        },
    });
    await tx.user.update({
        where: { id: order.userId },
        data: { lartCoinBalance: { increment: coins } },
    });
    return coins;
}

/**
 * Take back the coins an order earned (PAID order later cancelled).
 * Nets the order's existing ledger rows so calling twice deducts nothing extra.
 */
export async function revokeCoinsForOrder(
    tx: Tx,
    order: { id: string; userId: string }
): Promise<number> {
    const earned = await tx.lartCoinTransaction.aggregate({
        _sum: { coins: true },
        where: { orderId: order.id, userId: order.userId, type: { in: ['EARN', 'ADJUST'] } },
    });
    const net = earned._sum.coins ?? 0;
    if (net <= 0) return 0;

    await tx.lartCoinTransaction.create({
        data: {
            userId: order.userId,
            orderId: order.id,
            type: 'ADJUST',
            coins: -net,
            description: `Revoked: order #${order.id.slice(-6).toUpperCase()} was cancelled`,
        },
    });
    await tx.user.update({
        where: { id: order.userId },
        data: { lartCoinBalance: { decrement: net } },
    });
    return net;
}
