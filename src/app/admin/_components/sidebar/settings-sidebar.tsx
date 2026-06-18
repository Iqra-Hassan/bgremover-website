'use client';

import React from 'react';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const SettingaSidebar = ({
  items,
}: {
  items: {
    title: string;
    icon?: React.ReactNode;
    url: string;
  }[];
}) => {
  const pathname = usePathname();
  return (
    <SidebarMenu className="w-full flex-row overflow-x-auto lg:w-64 lg:flex-col">
      {items.map((item, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuButton isActive={pathname === item.url} asChild>
            <Link
              href={item.url}
              className="flex items-center gap-2.5 px-2.5 py-2.5 [&_svg]:!size-4.5"
            >
              {item.icon && item.icon}
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default SettingaSidebar;
