import React from 'react';
import LegalSettings from '../_components/legal-settings';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Legal - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = () => {
  return <LegalSettings />;
};

export default Page;
