import { getUserProfile } from '@/features/settings/user/action';
import UserProfileForm from '@/features/settings/user/components/UserProfileForm';

export default async function UserProfilePage() {
  const user = await getUserProfile();

  return (
    <div>
      <UserProfileForm initialData={user} />
    </div>
  );
}
