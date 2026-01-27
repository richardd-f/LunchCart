import { getShopWalletData } from "@/features/shopWallet/actions";
import { ShopWalletView } from "@/features/shopWallet/components/ShopWalletView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dompet Toko",
  description: "Kelola saldo dan riwayat transaksi toko Anda.",
};

export default async function ShopWalletPage() {
  const walletData = await getShopWalletData();

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
