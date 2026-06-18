import { Metadata } from 'next';
import React from 'react';

import LatestUsers from './_components/users';
import AdminStats from './_components/stats';
import { getPublicSettings } from '@/server/settings/setting-service';
import LatestPayments from './_components/payments';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Dashboard - ${settings?.general?.applicationName || ''}`,
  };
}

const DashboardPage = () => {
  return (
    <div className="space-y-5">
      <AdminStats />
      <LatestUsers />
      <LatestPayments />
    </div>
  );
};

export default DashboardPage;
