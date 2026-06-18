import SettingsSidebar from '@/app/admin/_components/sidebar/settings-sidebar';
import { HugeiconsCircleLock02, HugeiconsUser } from '@/components/icons';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

const items = [
  { title: 'Profile', icon: <HugeiconsUser />, url: '/admin/account' },
  {
    title: 'Security',
    icon: <HugeiconsCircleLock02 />,
    url: '/admin/account/security',
  },
];

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return (
    <div className="max-w-4xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <SettingsSidebar items={items} />
        <div className="flex flex-1 flex-col space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
