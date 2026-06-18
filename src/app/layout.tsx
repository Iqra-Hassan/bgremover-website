import React from 'react';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import '@/assets/styles/globals.css';
import Providers from './providers';
import 'moment-timezone';
import { getPublicSettings } from '@/server/settings/setting-service';
import { getSession } from '@/lib/auth';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  return {
    title: settings?.general?.siteTitle,
    description: settings?.general?.siteDescription,
    ...(settings?.general?.favicon && {
      icons: {
        icon: settings?.general?.favicon,
      },
    }),
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: settings?.general?.siteTitle,
      description: settings?.general?.siteDescription,
      ...(settings?.general?.coverImage && {
        images: [settings.general?.coverImage],
      }),
    },
  };
}
const geist = Geist({
  subsets: ['latin'],
  variable: '--geist-font',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, session] = await Promise.all([getPublicSettings(), getSession()]);

  return (
    <html suppressHydrationWarning lang="en">
      <body suppressHydrationWarning className={geist.variable}>
        <Providers settings={settings} user={session?.user}>
          {children}
        </Providers>
      </body>
    </html>
  );
}

export const dynamic = 'force-dynamic';
