import StorageSettings from '../_components/storage-settings';
import React from 'react';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Storage - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = () => {
  return (
    <>
      <StorageSettings />
    </>
  );
};

export default Page;
