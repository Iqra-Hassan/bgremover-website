import React from 'react';
import PostsTable from './_components/posts-table';

import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Posts - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = () => {
  return <PostsTable />;
};

export default Page;
