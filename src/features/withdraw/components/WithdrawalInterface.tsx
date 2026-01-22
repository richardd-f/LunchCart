'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { WithdrawShopItem, withdrawFromShop } from '../actions';
import UploadButton from '@/components/UploadButton';
import { CloudinaryUploadWidgetInfo } from 'next-cloudinary';
import Image from 'next/image';

interface WithdrawalInterfaceProps {
  shops: WithdrawShopItem[];
  initialQuery: string;
}

export default function WithdrawalInterface({ shops, initialQuery }: WithdrawalInterfaceProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [selectedShop, setSelectedShop] = useState<WithdrawShopItem | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/withdraw?query=${encodeURIComponent(query)}`);
  };

  const handleOpenModal = (shop: WithdrawShopItem) => {
    setSelectedShop(shop);
    setAmount('');
    setProofImage(null);
    setError(null);
    setSuccessMsg(null);
  };

  const handleCloseModal = () => {
    setSelectedShop(null);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) return;
    if (!proofImage) {
      setError("Proof image is required");
      return;
    }
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    startTransition(async () => {
      const res = await withdrawFromShop(selectedShop.id, amountVal, proofImage);
      if (res.success) {
        setSuccessMsg("Withdrawal successful!");
        setTimeout(() => {
          handleCloseModal();
          router.refresh();
        }, 1500);
      } else {
        const errMsg = Array.isArray(res.error) ? res.error.join(', ') : res.error || "Withdrawal failed";
        setError(errMsg);
      }
    });
  };

  const handleImageConfirmed = (results: CloudinaryUploadWidgetInfo[]) => {
    if (results && results.length > 0) {
      setProofImage(String(results[0].secure_url));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Money Withdrawal</h1>
      
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search shop by name..."
          className="flex-1 p-2 border border-gray-300 rounded focus:border-[#F97352] focus:outline-none"
        />
        <button
          type="submit"
          className="bg-[#F97352] text-white px-4 py-2 rounded hover:bg-[#e06646] transition-colors"
        >
          Search
        </button>
      </form>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-left">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-medium text-gray-600">Shop Name</th>
              <th className="px-6 py-3 font-medium text-gray-600">Wallet Balance (IDR)</th>
              <th className="px-6 py-3 font-medium text-gray-600 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {shops.length > 0 ? (
              shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{shop.name}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(shop.balance)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenModal(shop)}
                      className="text-[#F97352] hover:text-[#e06646] font-medium border border-[#F97352] hover:bg-[#FFF0EB] px-3 py-1 rounded transition-colors"
                    >
                      Withdraw
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  No shops found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedShop && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Confirm Withdrawal</h3>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleWithdraw} className="p-6 space-y-4">
              <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm border border-yellow-200">
                Warning: You will withdraw money from <strong>{selectedShop.name}</strong>.
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (IDR)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded focus:border-[#F97352] focus:ring-1 focus:ring-[#F97352] focus:outline-none"
                  placeholder="e.g. 50000"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Proof (Required)
                </label>
                {proofImage ? (
                  <div className="mt-2">
                    <div className="relative w-full h-40 mb-2 border rounded overflow-hidden bg-gray-50">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={proofImage} alt="Proof" className="w-full h-full object-contain" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setProofImage(null)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <UploadButton
                    options={{ maxFiles: 1, multiple: false }}
                    onConfirmed={handleImageConfirmed}
                  />
                )}
              </div>

              {error && <div className="text-red-600 text-sm">{error}</div>}
              {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  disabled={isPending || !!successMsg}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#F97352] text-white px-4 py-2 rounded hover:bg-[#e06646] disabled:opacity-50"
                  disabled={isPending || !!successMsg}
                >
                  {isPending ? 'Processing...' : 'Confirm Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
