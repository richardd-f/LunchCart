import { getUserProfile } from '@/features/settings/user/action';
import UserProfileForm from '@/features/settings/user/components/UserProfileForm';
import { getMyLartCoinBalance } from '@/features/lartCoin/actions';
import { LartCoinBalanceCard } from '@/features/lartCoin/components/LartCoinBalanceCard';

export default async function UserProfilePage() {
  const user = await getUserProfile();
  const coinData = await getMyLartCoinBalance();

  return (
    <div className="flex flex-col gap-6">
      {coinData && <LartCoinBalanceCard data={coinData} />}
      <UserProfileForm initialData={user} />
    </div>
  );
}
