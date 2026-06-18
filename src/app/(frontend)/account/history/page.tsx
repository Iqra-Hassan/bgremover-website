import React from 'react';
import EraseHistory from '../_components/erase-history';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `History - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = () => {
  return (
    <>
      <EraseHistory />
    </>
  );
};

export default Page;
