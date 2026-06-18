import AuthSettings from '../_components/auth-settings';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Auth - ${settings?.general?.applicationName || ''}`,
  };
}

const Page = async () => {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return <AuthSettings />;
};

export default Page;
