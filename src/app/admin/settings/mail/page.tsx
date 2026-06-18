import MailSettings from '../_components/mail-settings';
import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Mail - ${settings?.general?.applicationName || ''}`,
  };
}

export default function Page() {
  return <MailSettings />;
}
