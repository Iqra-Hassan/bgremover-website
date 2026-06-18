import React from 'react';
import ContactsTable from './_components/contacts-table';

import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Contacts - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = () => {
  return <ContactsTable />;
};

export default Page;
