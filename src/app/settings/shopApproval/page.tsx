import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShopApprovalPage } from "@/features/settings/shopApproval/components/ShopApprovalPage";

export default async function Page() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    redirect("/settings");
  }

  return (
    <div>
        <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900">Shop Approval</h2>
            <p className="mt-1 text-sm text-gray-500">
                Manage shop registrations and statuses.
            </p>
        </div>
        <ShopApprovalPage />
    </div>
  );
}