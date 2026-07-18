import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLartCoinConfig } from "@/features/lartCoin/actions";
import { LartCoinConfigForm } from "@/features/lartCoin/components/LartCoinConfigForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lart Coin Rates",
  description: "Configure Lart Coin earning and spending rates.",
};

export default async function LartCoinAdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/");
  }

  const config = await getLartCoinConfig();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Lart Coin Rates</h1>
        <p className="text-gray-600">
          Configure how customers earn Lart Coins and what each coin is worth.
        </p>
      </div>
      <LartCoinConfigForm initialConfig={config} />
    </div>
  );
}
