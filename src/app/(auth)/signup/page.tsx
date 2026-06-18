import SignupForm from './_components/signup-form';
import React from 'react';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Signup - ${settings?.general?.applicationName || ''}`,
  };
}

const SignupPage = () => {
  return <SignupForm />;
};

export default SignupPage;
