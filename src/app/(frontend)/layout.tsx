import React from 'react';
import Header from './_components/header';
import Footer from './_components/footer';
import { getPublicSettings } from '@/server/settings/setting-service';
import { redirect } from 'next/navigation';

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const settings = await getPublicSettings();
  if (!settings?.general?.applicationName) {
    redirect('/setup');
  }
  return (
    <div className="pt-20">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
