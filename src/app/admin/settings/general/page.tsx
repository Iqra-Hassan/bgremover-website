import GeneralSettings from '../_components/general-settings';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `General - ${settings?.general?.applicationName || ''}`,
  };
}

export default function Page() {
  return <GeneralSettings />;
}
