'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { updateLartCoinConfig, LartCoinConfigData } from '../actions';

const formatIDR = (amount: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);

interface LartCoinConfigFormProps {
  initialConfig: LartCoinConfigData;
}

export function LartCoinConfigForm({ initialConfig }: LartCoinConfigFormProps) {
  const [state, action, isPending] = useActionState(updateLartCoinConfig, {});
  const [purchaseAmountPerCoin, setPurchaseAmountPerCoin] = useState(initialConfig.purchaseAmountPerCoin);
  const [coinValueRupiah, setCoinValueRupiah] = useState(initialConfig.coinValueRupiah);

  useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.message) toast.success(state.message);
  }, [state]);

  return (
    <form action={action} className="max-w-2xl bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6 flex flex-col gap-6">
        <div>
          <label htmlFor="purchaseAmountPerCoin" className="block text-sm font-medium text-gray-700">
            Purchase amount per coin (Rupiah)
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              id="purchaseAmountPerCoin"
              name="purchaseAmountPerCoin"
              min="1"
              value={purchaseAmountPerCoin}
              onChange={(e) => setPurchaseAmountPerCoin(Math.max(1, parseInt(e.target.value) || 1))}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
            />
            <span className="text-sm text-gray-500">= 1 Lart Coin earned</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Customers earn 1 Lart Coin for every {formatIDR(purchaseAmountPerCoin)} of paid purchases.
          </p>
        </div>

        <div>
          <label htmlFor="coinValueRupiah" className="block text-sm font-medium text-gray-700">
            Coin value (Rupiah)
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="number"
              id="coinValueRupiah"
              name="coinValueRupiah"
              min="1"
              value={coinValueRupiah}
              onChange={(e) => setCoinValueRupiah(Math.max(1, parseInt(e.target.value) || 1))}
              className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-[#F97352] focus:ring-[#F97352] sm:text-sm p-2 border"
            />
            <span className="text-sm text-gray-500">per 1 Lart Coin</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            When spent on coin menus, 1 Lart Coin converts to {formatIDR(coinValueRupiah)} for the shop.
          </p>
        </div>
      </div>
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 sm:rounded-b-lg">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#F97352] hover:bg-[#e06646] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F97352] disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Rates'}
        </button>
      </div>
    </form>
  );
}
