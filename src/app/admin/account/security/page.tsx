import ChangePassword from './_components/change-password';
import UserPasskeys from './_components/passkeys';
import UserSessions from './_components/user-sessions';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';

import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Security - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = async () => {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return (
    <>
      <ChangePassword />
      <UserPasskeys />
      <UserSessions currentSession={session.session} />
    </>
  );
};

export default Page;
