import { redirect } from 'next/navigation';
import React from 'react';

import SetupForm from './setup-form';
import commonService from '@/server/common/common-service';

export const metadata = {
  title: 'Setup',
  description: 'Setup your application',
};

const SetupPage = async () => {
  const isSetupComplete = await commonService.checkSetup();

  if (isSetupComplete) {
    redirect('/'); // Redirect to the home page if setup is complete
  }

  return <SetupForm />;
};

export default SetupPage;
