'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import React from 'react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: 'User Information', href: '/settings/user' },
    { name: 'Shop Information', href: '/settings/shop' },
  ];

  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  
  const [isOwner, setIsOwner] = React.useState(false);

  React.useEffect(() => {
    import('@/features/settings/shop/utils').then(({ getIsShopOwner }) => {
        getIsShopOwner().then(setIsOwner);
    });
  }, [session?.user?.id]);

  if (isAdmin) {
    tabs.push({ name: 'Shop Approval', href: '/settings/shopApproval' });
  }

  if (isOwner) {
    tabs.push({ name: 'Shop Staff', href: '/settings/shopStaff' });
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and shop preferences.
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    isActive
                      ? 'border-[#F97352] text-[#F97352]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8">
        {children}
      </div>
    </div>
  );
}
