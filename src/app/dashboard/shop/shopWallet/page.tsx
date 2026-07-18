import { getShopWalletData } from "@/features/shopWallet/actions";
import { ShopWalletView } from "@/features/shopWallet/components/ShopWalletView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dompet Toko",
  description: "Kelola saldo dan riwayat transaksi toko Anda.",
};

export default async function ShopWalletPage() {
  const walletData = await getShopWalletData();

  if (!walletData) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Owner access only</h2>
          <p className="mt-2 text-sm text-gray-500">
            The shop wallet is only available to the shop owner.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shop Wallet</h1>
        <p className="text-gray-600">
          Summary of your finance shop history.
        </p>
      </div>
      <ShopWalletView data={walletData} />
    </div>
  );
}
