import LoginForm from './_components/login-form';
import React from 'react';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Login - ${settings?.general?.applicationName || ''}`,
  };
}

const LoginPage = () => {
  return <LoginForm />;
};

export default LoginPage;
