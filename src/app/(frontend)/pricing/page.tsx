import React from 'react';
import PricingGrid from './_components/pricing-grid';
import planService from '@/server/plans/plan-service';
import Faqs from '../_components/faqs';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Pricing - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = async () => {
  const plans = await planService.getPublicPlans();
  return (
    <>
      <div className="py-6 md:py-12">
        <PricingGrid plans={plans} />
      </div>
      <Faqs />
    </>
  );
};

export default Page;
