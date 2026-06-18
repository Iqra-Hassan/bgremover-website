import AdvanceSettings from '../_components/advance-settings';

import { Metadata } from 'next';
import { getPublicSettings } from '@/server/settings/setting-service';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();

  return {
    title: `Advance - ${settings?.general?.applicationName || ''}`,
  };
}

export default function Page() {
  return <AdvanceSettings />;
}
