'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { AlignJustifyIcon } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import Logo from '@/app/admin/_components/sidebar/logo';

const menuLinks = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Tools',
    items: [
      {
        label: 'Object Remover',
        href: '/remove-objects',
      },
      {
        label: 'Background Remover',
        href: '/',
      },
      {
        label: 'Upscale Image',
        href: '/upscale-image',
      },
    ],
  },
  {
    label: 'Pricing',
    href: '/pricing',
  },
  {
    label: 'Blog',
    href: '/blog',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

const HeaderMenu = () => {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <AlignJustifyIcon className="size-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[320px]">
          <SheetHeader className="px-4">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <Logo />
          </SheetHeader>
          <nav className="flex flex-col space-y-2 px-4">
            {menuLinks.map((link, index) => (
              <React.Fragment key={index}>
                {link.items ? (
                  <div className="flex flex-col space-y-2">
                    {link.items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      {
                        'bg-primary text-primary-foreground': pathname === link.href,
                        'hover:bg-muted': pathname !== link.href,
                      },
                    )}
                  >
                    {link.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <NavigationMenu
      viewport={false}
      className="bg-muted flex items-center gap-2 rounded-full px-1 py-0.5"
    >
      <NavigationMenuList>
        {menuLinks.map((link, index) => (
          <NavigationMenuItem key={index}>
            {link.items ? (
              <>
                <NavigationMenuTrigger className="!rounded-full !bg-transparent">
                  {link.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="flex !min-w-[200px] flex-col space-y-2">
                  {link.items.map((item) => (
                    <NavigationMenuLink asChild key={item.href}>
                      <Link href={item.href}>{item.label}</Link>
                    </NavigationMenuLink>
                  ))}
                </NavigationMenuContent>
              </>
            ) : (
              <NavigationMenuLink asChild>
                <Link
                  className={cn(
                    'relative !rounded-full px-4 py-1.5 text-[14px] font-medium transition-all',
                    {
                      '!text-primary !bg-background !shadow-sm': pathname === link.href,
                    },
                  )}
                  href={link.href}
                >
                  {link.label}
                </Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default HeaderMenu;
