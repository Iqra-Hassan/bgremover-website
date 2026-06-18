'use client';

import React from 'react';

import StatBox from './stat-box';
import { useAdminStats } from '../use-dashboard';
import {
  HugeiconsCoins02,
  HugeiconsMoneyExchange01,
  HugeiconsSparkles,
  HugeiconsUserGroup,
} from '@/components/icons';
import { formatPrice, getCurrencySymbol } from '@/lib/utils';
import { useSettings } from '@/components/settings-provider';

const AdminStats = () => {
  const { stats, isLoading } = useAdminStats();
  const settings = useSettings();
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
      <StatBox
        name="Images Processed"
        icon={<HugeiconsSparkles />}
        value={stats?.imagesProcessed || 0}
        isLoading={isLoading}
      />
      <StatBox
        name="Credits Used"
        icon={<HugeiconsCoins02 />}
        value={stats?.creditsUsed || 0}
        isLoading={isLoading}
      />
      <StatBox
        name="Earnings"
        icon={<HugeiconsMoneyExchange01 />}
        value={`${getCurrencySymbol(settings?.billing.currency || 'USD')} ${formatPrice(stats?.totalEarning._sum.price || 0)}`}
        isLoading={isLoading}
      />
      <StatBox
        name="Users"
        icon={<HugeiconsUserGroup />}
        value={stats?.usersCount || 0}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminStats;
