'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { capitalize } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { ProfileMenu } from './profile-menu';
import { User } from '@/lib/auth';

export function SiteHeader({ user }: { user: User }) {
  const pathname = usePathname();
  const pageName = pathname.split('/')?.[2];

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-lg font-medium">{capitalize(pageName || 'Dashboard')}</h1>
        <div className="ml-auto flex items-center gap-4">
          <ProfileMenu user={user} />
        </div>
      </div>
    </header>
  );
}
