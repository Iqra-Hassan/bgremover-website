import React from 'react';
import MediaTable from './_components/mediaTable';

import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Media - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = () => {
  return <MediaTable />;
};

export default Page;
