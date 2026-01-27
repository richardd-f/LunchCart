import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function ShopDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Real-time database check to prevent stale session access
  const shopRole = await prisma.userShopRole.findFirst({
    where: { userId: session.user.id },
  });

  if (!shopRole) {
    redirect('/error?message=' + encodeURIComponent('Access denied. You must be a shop owner or staff to access this page.'));
  }

  return <>{children}</>;
}
