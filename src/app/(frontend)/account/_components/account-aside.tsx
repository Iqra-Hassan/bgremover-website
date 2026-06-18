'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import {
  HugeiconsCircleLock02,
  HugeiconsCreditCard,
  HugeiconsRightToLeftListDash,
  HugeiconsUserAccount,
} from '@/components/icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const items = [
  { title: 'Account', icon: <HugeiconsUserAccount />, url: '/account' },
  {
    title: 'Security',
    icon: <HugeiconsCircleLock02 />,
    url: '/account/security',
  },
  {
    title: 'Billing',
    icon: <HugeiconsCreditCard />,
    url: '/account/billing',
  },
  {
    title: 'History',
    icon: <HugeiconsRightToLeftListDash />,
    url: '/account/history',
  },
];

const AccountAside = () => {
  const pathname = usePathname();
  return (
    <div className="flex w-full flex-row gap-1 overflow-x-auto sm:w-[180px] sm:flex-col sm:gap-2">
      {items.map((item) => (
        <Link
          key={item.url}
          href={item.url}
          className={cn(
            'text-muted-foreground bg-background flex items-center gap-1 rounded-full border px-2 py-1.5 sm:gap-2 sm:px-2.5',
            pathname === item.url && 'bg-primary text-primary-foreground',
          )}
        >
          <span className="flex size-4 items-center justify-center sm:size-6 [&>svg]:size-4.5">
            {item.icon}
          </span>
          <span className="text-xs font-medium sm:text-sm">{item.title}</span>
        </Link>
      ))}
    </div>
  );
};

export default AccountAside;
