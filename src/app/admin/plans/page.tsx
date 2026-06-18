import React from 'react';
import PlansTable from './_components/plans-table';

import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Plans - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = () => {
  return <PlansTable />;
};

export default Page;
