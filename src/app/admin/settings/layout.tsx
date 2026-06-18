import SettingsSidebar from '@/app/admin/_components/sidebar/settings-sidebar';
import {
  HugeiconsCreditCard,
  HugeiconsHome09,
  HugeiconsInboxUpload,
  HugeiconsShieldUser,
  HugeiconsMail02,
  HugeiconsLegal01,
  HugeiconsSettings01,
} from '@/components/icons';

const items = [
  { title: 'General', icon: <HugeiconsHome09 />, url: '/admin/settings/general' },
  {
    title: 'Billing',
    icon: <HugeiconsCreditCard />,
    url: '/admin/settings/billing',
  },
  {
    title: 'Auth',
    icon: <HugeiconsShieldUser />,
    url: '/admin/settings/auth',
  },
  {
    title: 'Storage',
    icon: <HugeiconsInboxUpload />,
    url: '/admin/settings/storage',
  },
  {
    title: 'Mail',
    icon: <HugeiconsMail02 />,
    url: '/admin/settings/mail',
  },
  {
    title: 'Legal',
    icon: <HugeiconsLegal01 />,
    url: '/admin/settings/legal',
  },
  {
    title: 'Advance',
    icon: <HugeiconsSettings01 />,
    url: '/admin/settings/advance',
  },
];

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-4xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-10">
        <SettingsSidebar items={items} />
        <div className="flex flex-1 flex-col space-y-4">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
