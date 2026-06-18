import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HugeiconsCoins02,
  HugeiconsLogout03,
  HugeiconsUser,
  HugeiconsShieldUser,
} from '@/components/icons';
import { Avatar } from '@/components/ui/avatar';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import DeleteAlert from '@/components/ui/delete-alert';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/data/constans';

const HeaderProfile = () => {
  const { user, updateUser } = useAuth();
  const { data: credits } = useQuery({
    queryKey: [queryKeys.credits],
    queryFn: async () => {
      const response = await apiClient.api.users.credits.$get();

      const result = await response.json();
      if (!response.ok) {
        const error = result as unknown as { message?: string };
        throw new Error(error?.message || 'Failed to fetch credits');
      }

      return result.credits;
    },
    enabled: !!user,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
    } catch {
      toast.error('Failed to log out. Please try again.');
    } finally {
      updateUser(undefined);
      setIsLoading(false);
      setShowLogoutConfirmation(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {user ? (
        <>
          <div className="bg-primary/5 border-primary/20 text-primary mr-2 flex items-center gap-1.5 rounded-xl border border-dashed px-2 py-1">
            <HugeiconsCoins02 className="size-3.5 text-inherit" />
            <span className="text-xs font-bold">{credits || 0}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="text-muted-foreground rounded-xl">
              <Avatar name={user.name} src={user.image || undefined} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-64 rounded-3xl border shadow-[0px_4px_10px_#00000010]"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 p-3 text-left text-sm">
                  <Avatar name={user.name} src={user.image || undefined} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="text-muted-foreground truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup className="p-1">
                <DropdownMenuItem
                  asChild
                  className="text-muted-foreground h-10 gap-3 rounded-xl p-3"
                >
                  <Link href="/account">
                    <HugeiconsUser className="size-4.5 text-inherit" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem
                    asChild
                    className="text-muted-foreground h-10 gap-3 rounded-xl p-3"
                  >
                    <Link href="/admin">
                      <HugeiconsShieldUser className="size-4.5 text-inherit" />
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => setShowLogoutConfirmation(true)}
                  variant="destructive"
                  className="text-muted-foreground h-10 gap-3 rounded-xl p-3 pl-3.5"
                >
                  <HugeiconsLogout03 className="size-4.5 text-inherit" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuGroup>
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
      ) : (
        <>
          <Button variant="ghost" asChild className="rounded-full">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/signup">Get started</Link>
          </Button>
        </>
      )}
    </div>
  );
};

export default HeaderProfile;
