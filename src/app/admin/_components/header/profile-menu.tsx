'use client';

import { Avatar } from '@/components/ui/avatar';
import DeleteAlert from '@/components/ui/delete-alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/lib/auth';
import { HugeiconsLogout03, HugeiconsUser } from '@/components/icons';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { MonitorSmartphone, MoonIcon, PaletteIcon, SunIcon } from 'lucide-react';

export function ProfileMenu({ user }: { user: User }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
    } catch {
      toast.error('Failed to log out. Please try again.');
    } finally {
      setIsLoading(false);
      setShowLogoutConfirmation(false);
      window.location.href = '/';
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-lg">
          <Avatar name={user.name} src={user.image || undefined} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-56" side="bottom" align="end" sideOffset={4}>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar name={user.name} src={user.image || undefined} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/admin/account">
                <HugeiconsUser />
                Account
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2">
                <PaletteIcon className="size-4 stroke-[1.7]" />
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="min-w-40">
                  <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                    <DropdownMenuRadioItem value="light">
                      <SunIcon className="stroke-[1.7]" />
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <MoonIcon className="stroke-[1.7]" />
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <MonitorSmartphone className="stroke-[1.7]" />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowLogoutConfirmation(true)} variant="destructive">
            <HugeiconsLogout03 />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteAlert
        title="Are you sure you want to log out?"
        description="You will be logged out of your account."
        open={showLogoutConfirmation}
        confirmText="Log out"
        onCancel={() => setShowLogoutConfirmation(false)}
        isLoading={isLoading}
        onConfirm={handleLogout}
      />
    </>
  );
}
