'use client';

import React from 'react';
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SettingsProvider from '@/components/settings-provider';
import { PublicSettings } from '@/server/settings/setting-service';
import AuthProvider from '@/components/auth-provider';
import { User } from '@/lib/auth';

const Providers = ({
  children,
  settings,
  user,
}: {
  children: React.ReactNode;
  settings: PublicSettings;
  user?: User;
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        placeholderData: (previousData: any) => previousData,
      },
    },
  });

  return (
    <AuthProvider user={user}>
      <SettingsProvider settings={settings}>
        <NextTopLoader color="var(--primary)" showSpinner={false} height={2} />
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryClientProvider>
        <Toaster />
      </SettingsProvider>
    </AuthProvider>
  );
};

export default Providers;
