'use client';

import Logo from '@/app/admin/_components/sidebar/logo';
import React from 'react';
import HeaderMenu from './menu';
import HeaderProfile from './profile';
import { cn } from '@/lib/utils';
import { useScrollY } from '@/hooks/use-scrolly';

const Header = () => {
  const isScrollY = useScrollY();

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full border-b border-dashed backdrop-blur-sm',
        isScrollY > 50 && 'bg-background/70',
      )}
    >
      <div className="container">
        <div className="flex h-20 items-center justify-between gap-2 py-2">
          <div className="flex-1">
            <Logo />
          </div>
          <div className="hidden md:block">
            <HeaderMenu />
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <div className="md:hidden">
              <HeaderMenu />
            </div>
            <HeaderProfile />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
