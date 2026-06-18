import settingService, { getPublicSettings } from '@/server/settings/setting-service';
import { Metadata } from 'next';
import React from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Terms of Service - ${settings?.general?.applicationName || ''}`,
  };
}

const TermsOfServicePage = async () => {
  const legal = await settingService.getSetting('legal');

  return (
    <div className="container !max-w-[800px] py-16 sm:py-24">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <div>
        <div
          className="prose dark:prose-invert mt-10"
          dangerouslySetInnerHTML={{ __html: legal?.termsOfService || '' }}
        />
      </div>
    </div>
  );
};

export default TermsOfServicePage;
