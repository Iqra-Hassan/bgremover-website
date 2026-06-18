'use client';

import * as React from 'react';

import { NavMain } from './menu';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import {
  HugeiconsAlignBoxTopLeft,
  HugeiconsCreditCard,
  HugeiconsImage03,
  HugeiconsMail02,
  HugeiconsMenuSquare,
  HugeiconsMoneyExchange01,
  HugeiconsSettings01,
  HugeiconsUserGroup,
} from '@/components/icons';
import Logo from './logo';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: HugeiconsMenuSquare,
    },
    {
      title: 'Users',
      url: '/admin/users',
      icon: HugeiconsUserGroup,
    },
    {
      title: 'Contacts',
      url: '/admin/contacts',
      icon: HugeiconsMail02,
    },
    {
      title: 'Posts',
      url: '/admin/posts',
      icon: HugeiconsAlignBoxTopLeft,
    },
    {
      title: 'Media',
      url: '/admin/media',
      icon: HugeiconsImage03,
    },
  ],
  billingNav: [
    {
      title: 'Payments',
      url: '/admin/payments',
      icon: HugeiconsMoneyExchange01,
    },
    {
      title: 'Plans',
      url: '/admin/plans',
      icon: HugeiconsCreditCard,
    },
  ],
  bottomNav: [
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: HugeiconsSettings01,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <Logo href="/admin/dashboard" />
        <hr className="mt-3" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavMain items={data.billingNav} title="Billing" />
      </SidebarContent>
      <SidebarFooter>
        <NavMain items={data.bottomNav} />
      </SidebarFooter>
    </Sidebar>
  );
}
