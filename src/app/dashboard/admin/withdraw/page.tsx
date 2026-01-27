import WithdrawalInterface from "@/features/withdraw/components/WithdrawalInterface";
import { getWithdrawalShops } from "@/features/withdraw/actions";

export default async function WithdrawPage(props: {
  searchParams: Promise<{ query?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams?.query;
  const query = typeof q === 'string' ? q : Array.isArray(q) ? q[0] : "";
  const result = await getWithdrawalShops(query);
  const shops = result.success && result.data ? result.data : [];

  return <WithdrawalInterface shops={shops} initialQuery={query} />;
}