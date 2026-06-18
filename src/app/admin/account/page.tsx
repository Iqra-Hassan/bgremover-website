import AppearanceSettings from './_components/appearance-settings';
import ProfileSettings from './_components/profile-settings';
import React from 'react';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Account - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = async () => {
  return (
    <>
      <ProfileSettings />
      <AppearanceSettings />
    </>
  );
};

export default Page;
