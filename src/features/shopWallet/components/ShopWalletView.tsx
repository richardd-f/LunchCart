"use client";

import React from "react";
import { Transaction, TransactionType } from "@prisma/client";
import { WalletData } from "../actions";

interface ShopWalletViewProps {
  data: WalletData;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

export function ShopWalletView({ data }: ShopWalletViewProps) {
  const { balance, pendingBalance, transactions } = data;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Current Balance Card */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Current Balance
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {formatCurrency(balance)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Available balance ready to withdraw
          </p>
        </div>

        {/* Pending Balance Card */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Pending Balance
          </h3>
          <p className="mt-2 text-3xl font-bold text-orange-600">
            {formatCurrency(pendingBalance)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            From pending order
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Transaction History
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Activity</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    Transaction history is not available
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => {
                  const isCredit = tx.type === TransactionType.credit;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {tx.description || "Transaksi Tanpa Keterangan"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td
                        className={`px-6 py-4 text-right font-bold whitespace-nowrap ${
                          isCredit ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isCredit ? "+" : "-"} {formatCurrency(Number(tx.amount))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
