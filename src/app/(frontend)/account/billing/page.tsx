import React from 'react';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';
import TransactionsHistory from '../_components/transaction-history';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Billing - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = () => {
  return (
    <>
      <TransactionsHistory />
    </>
  );
};

export default Page;
