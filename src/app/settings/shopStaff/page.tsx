import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ShopStaffPage from '@/features/settings/shopStaff/components/ShopStaffPage';
import { getShopStaff } from '@/features/settings/shopStaff/action';

export default async function Page() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Double check if user is OWNER to protect the route (getShopStaff also checks, but good to redirect if fail)
  const result = await getShopStaff();

  if ('error' in result) {
      // If error (e.g. not an owner), redirect to settings root or show error
      redirect('/settings');
  }

  return (
    <div>
        <ShopStaffPage initialStaff={result.data || []} currentUserId={session.user.id} />
    </div>
  );
}
