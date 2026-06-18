import React from 'react';
import PaymentsTable from './_components/payments-table';

import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Payments - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = () => {
  return <PaymentsTable />;
};

export default Page;
