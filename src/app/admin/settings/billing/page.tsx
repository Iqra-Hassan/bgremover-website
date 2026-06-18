import React from 'react';
import BillingSettings from '../_components/billing-settings';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Billing - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = () => {
  return <BillingSettings />;
};

export default Page;
